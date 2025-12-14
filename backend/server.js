const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./config/database');

const app = express();
const PORT = 5000;

// ==================== MIDDLEWARE SETUP ====================
// IMPORTANT: Order matters! Configure in this exact order:

// 1. First, enable CORS with proper configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// 2. Configure static file serving BEFORE body parsers
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// 3. Then add body parsers
app.use(express.json({ limit: '10mb' })); // Increased limit for JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'public', 'uploads', 'venues');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'venue-' + uniqueSuffix + extension);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

// ==================== HELPER FUNCTIONS ====================
const parseImagesField = (images) => {
    console.log('🔍 Parsing images field:', { type: typeof images, value: images });
    
    if (!images) return [];
    
    try {
        // If it's already an array, return it
        if (Array.isArray(images)) {
            return images.map(img => {
                // Convert full URLs to relative paths if needed
                if (img.startsWith('http://localhost:5000')) {
                    return img.replace('http://localhost:5000', '');
                }
                return img;
            });
        }
        
        // If it's a string, try to parse it
        if (typeof images === 'string') {
            const trimmed = images.trim();
            if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
                return [];
            }
            
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed.map(img => {
                        if (img.startsWith('http://localhost:5000')) {
                            return img.replace('http://localhost:5000', '');
                        }
                        return img;
                    });
                }
            } catch (jsonError) {
                // Not JSON, return as single item array
                const img = trimmed.startsWith('http://localhost:5000') 
                    ? trimmed.replace('http://localhost:5000', '')
                    : trimmed;
                return [img];
            }
        }
    } catch (error) {
        console.error('❌ Error parsing images:', error);
    }
    
    return [];
};

// Helper function to ensure proper image URLs
const ensureImageUrl = (imagePath) => {
    if (!imagePath || imagePath === 'null' || imagePath === 'undefined') {
        return 'https://via.placeholder.com/800x400?text=No+Venue+Image';
    }
    
    // If it's already a full URL, return it
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // If it's a relative path starting with /uploads/, add base URL
    if (imagePath.startsWith('/uploads/')) {
        return `http://localhost:5000${imagePath}`;
    }
    
    // If it's just a filename, construct the full path
    if (imagePath && !imagePath.startsWith('/') && imagePath.includes('.')) {
        return `http://localhost:5000/uploads/venues/${imagePath}`;
    }
    
    return 'https://via.placeholder.com/800x400?text=No+Venue+Image';
};

// ==================== BASIC ROUTES ====================

app.get('/', (req, res) => {
    res.json({ message: 'VenuEase Server is running!' });
});

app.get('/api/test-db', async (req, res) => {
    try {
        const [results] = await db.execute('SELECT 1 + 1 AS result');
        const [admins] = await db.execute('SELECT COUNT(*) as count FROM ADMIN');
        const [customers] = await db.execute('SELECT COUNT(*) as count FROM CUSTOMERS');
        res.json({ 
            message: 'Database connected successfully',
            testResult: results[0].result,
            adminCount: admins[0].count,
            customersCount: customers[0].count,
            status: 'OK'
        });
    } catch (error) {
        res.status(500).json({ error: 'Database connection failed: ' + error.message });
    }
});

app.get('/api/health', async (req, res) => {
    try {
        const [dbTest] = await db.execute('SELECT 1');
        const [customers] = await db.execute('SELECT COUNT(*) as count FROM CUSTOMERS');
        const [venues] = await db.execute('SELECT COUNT(*) as count FROM VENUE');
        
        res.json({
            status: 'healthy',
            serverTime: new Date().toISOString(),
            database: 'connected',
            customersCount: customers[0].count,
            venuesCount: venues[0].count
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

app.get('/api/debug/tables', async (req, res) => {
    try {
        const [tables] = await db.execute(`
            SELECT TABLE_NAME, TABLE_ROWS 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = 'VenuEase'
        `);
        res.json(tables);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== CUSTOMER ROUTES ====================

app.post('/api/customer/register', async (req, res) => {
    console.log('🔔 Registration request:', { body: req.body });
    
    const { full_Name, email, password, phone } = req.body;

    if (!full_Name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const [existingCustomers] = await db.execute(
            'SELECT * FROM CUSTOMERS WHERE email = ?', 
            [email]
        );

        if (existingCustomers.length > 0) {
            return res.status(400).json({ error: 'Customer already exists' });
        }

        const saltRounds = 10;
        const password_Hash = await bcrypt.hash(password, saltRounds);
        
        const [result] = await db.execute(
            'INSERT INTO CUSTOMERS (full_Name, email, password_Hash, phone) VALUES (?, ?, ?, ?)',
            [full_Name, email, password_Hash, phone || null]
        );

        res.status(201).json({ 
            message: 'Customer registered successfully',
            customer_ID: result.insertId,
            full_Name: full_Name,
            email: email
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

app.post('/api/customer/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const [customers] = await db.execute(
            'SELECT customer_ID, full_Name, email, password_Hash, phone FROM CUSTOMERS WHERE email = ? AND is_Active = TRUE', 
            [email]
        );

        if (customers.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const customer = customers[0];
        const isPasswordValid = await bcrypt.compare(password, customer.password_Hash);
        
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        res.json({ 
            message: 'Login successful',
            user: {
                user_ID: customer.customer_ID,
                full_Name: customer.full_Name,
                email: customer.email,
                phone: customer.phone,
                role: 'customer'
            }
        });

    } catch (error) {
        console.error('Customer login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== ADMIN ROUTES ====================

app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const [admins] = await db.execute(
            'SELECT admin_ID, full_Name, email, password_Hash, role FROM ADMIN WHERE email = ?', 
            [email]
        );

        if (admins.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const admin = admins[0];
        const isPasswordValid = password === admin.password_Hash;
        
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        res.json({ 
            message: 'Login successful',
            user: {
                user_ID: admin.admin_ID,
                full_Name: admin.full_Name,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== VENUE MANAGEMENT ROUTES ====================
// IMPORTANT: These are updated with proper image handling

app.get('/api/admin/venues', async (req, res) => {
    try {
        const [venues] = await db.execute(`
            SELECT 
                venue_ID,
                venue_Name,
                address,
                capacity,
                price,
                contact_Email,
                contact_Phone,
                description,
                images,
                is_Available,
                date_Created
            FROM VENUE 
            ORDER BY venue_Name
        `);
        
        // Use helper function to parse images
        const venuesWithParsedImages = venues.map(venue => ({
            ...venue,
            images: parseImagesField(venue.images)
        }));
        
        res.json(venuesWithParsedImages);
    } catch (error) {
        console.error('Error fetching venues:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/admin/venues/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [venues] = await db.execute(`
            SELECT * FROM VENUE WHERE venue_ID = ?
        `, [id]);
        
        if (venues.length === 0) {
            return res.status(404).json({ error: 'Venue not found' });
        }
        
        const venueWithImages = {
            ...venues[0],
            images: parseImagesField(venues[0].images)
        };
        
        res.json(venueWithImages);
    } catch (error) {
        console.error('Error fetching venue:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/admin/venues', async (req, res) => {
    try {
        console.log('📥 Creating venue with data:', req.body);
        
        const { 
            venue_Name, 
            address, 
            capacity, 
            price, 
            contact_Email, 
            contact_Phone, 
            description,
            images 
        } = req.body;

        // Validate required fields
        if (!venue_Name || !address || !capacity || !price) {
            return res.status(400).json({ 
                error: 'Name, address, capacity, and price are required'
            });
        }

        // Parse images using helper function
        const imagesArray = parseImagesField(images);
        console.log('🖼️ Parsed images array:', imagesArray);

        // Prepare images for storage
        let imagesForDB = null;
        if (imagesArray.length > 0) {
            imagesForDB = JSON.stringify(imagesArray);
        }

        console.log('💾 Storing images in DB:', imagesForDB);

        const [result] = await db.execute(
            `INSERT INTO VENUE 
                (venue_Name, address, capacity, price, contact_Email, contact_Phone, description, images, is_Available) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [
                venue_Name, 
                address, 
                parseInt(capacity), 
                parseFloat(price), 
                contact_Email || null, 
                contact_Phone || null, 
                description || null,
                imagesForDB
            ]
        );

        // Get the newly created venue
        const [newVenue] = await db.execute(
            'SELECT * FROM VENUE WHERE venue_ID = ?',
            [result.insertId]
        );

        const venueWithImages = {
            ...newVenue[0],
            images: parseImagesField(newVenue[0].images)
        };

        res.status(201).json({
            message: 'Venue created successfully',
            venue: venueWithImages
        });
    } catch (error) {
        console.error('❌ Error creating venue:', error);
        res.status(500).json({ 
            error: 'Internal server error: ' + error.message,
            sqlMessage: error.sqlMessage
        });
    }
});

app.put('/api/admin/venues/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('📝 Updating venue:', id, req.body);

        // Check if venue exists
        const [existing] = await db.execute(
            'SELECT venue_ID FROM VENUE WHERE venue_ID = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Venue not found' });
        }

        const { 
            venue_Name, 
            address, 
            capacity, 
            price, 
            contact_Email, 
            contact_Phone, 
            description,
            images,
            is_Available 
        } = req.body;

        // Parse images using helper function
        const imagesArray = parseImagesField(images);
        let imagesForDB = null;
        if (imagesArray.length > 0) {
            imagesForDB = JSON.stringify(imagesArray);
        }

        // Update venue
        await db.execute(
            `UPDATE VENUE SET 
                venue_Name = ?,
                address = ?,
                capacity = ?,
                price = ?,
                contact_Email = ?,
                contact_Phone = ?,
                description = ?,
                images = ?,
                is_Available = ?
            WHERE venue_ID = ?`,
            [
                venue_Name, 
                address, 
                parseInt(capacity), 
                parseFloat(price), 
                contact_Email || null, 
                contact_Phone || null, 
                description || null,
                imagesForDB,
                is_Available !== undefined ? is_Available : true,
                id
            ]
        );

        // Get updated venue
        const [updatedVenue] = await db.execute(
            'SELECT * FROM VENUE WHERE venue_ID = ?',
            [id]
        );

        const venueWithImages = {
            ...updatedVenue[0],
            images: parseImagesField(updatedVenue[0].images)
        };

        res.json({
            message: 'Venue updated successfully',
            venue: venueWithImages
        });
    } catch (error) {
        console.error('Error updating venue:', error);
        res.status(500).json({ 
            error: 'Internal server error: ' + error.message
        });
    }
});

app.delete('/api/admin/venues/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.execute(
            'SELECT venue_ID FROM VENUE WHERE venue_ID = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Venue not found' });
        }

        const [bookings] = await db.execute(
            'SELECT COUNT(*) as count FROM BOOKING WHERE venue_ID = ?',
            [id]
        );

        if (bookings[0].count > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete venue with existing bookings' 
            });
        }

        await db.execute('DELETE FROM VENUE WHERE venue_ID = ?', [id]);

        res.json({ message: 'Venue deleted successfully' });
    } catch (error) {
        console.error('Error deleting venue:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/admin/venues/stats', async (req, res) => {
    try {
        const [totalVenues] = await db.execute('SELECT COUNT(*) as count FROM VENUE');
        const [availableVenues] = await db.execute('SELECT COUNT(*) as count FROM VENUE WHERE is_Available = TRUE');
        const [unavailableVenues] = await db.execute('SELECT COUNT(*) as count FROM VENUE WHERE is_Available = FALSE');
        const [recentVenues] = await db.execute('SELECT COUNT(*) as count FROM VENUE WHERE date_Created >= DATE_SUB(NOW(), INTERVAL 7 DAY)');
        
        res.json({
            total: totalVenues[0].count,
            available: availableVenues[0].count,
            unavailable: unavailableVenues[0].count,
            recent: recentVenues[0].count
        });
    } catch (error) {
        console.error('Error fetching venue stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== IMAGE UPLOAD ROUTES ====================

app.post('/api/admin/venues/upload', upload.array('images', 5), async (req, res) => {
    try {
        console.log('📤 Upload endpoint called');
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        
        // Generate relative image URLs (without the full domain)
        const imageUrls = req.files.map(file => {
            // Return relative path ONLY
            return `/uploads/venues/${file.filename}`;
        });
        
        console.log('Returning relative image URLs:', imageUrls);
        
        res.json({
            message: 'Files uploaded successfully',
            images: imageUrls  // These should be relative paths like '/uploads/venues/filename.jpg'
        });
    } catch (error) {
        console.error('❌ Error uploading files:', error);
        res.status(500).json({ 
            error: 'Error uploading files: ' + error.message
        });
    }
});

app.post('/api/admin/venues/upload/single', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const imageUrl = `/uploads/venues/${req.file.filename}`;
        
        res.json({
            message: 'File uploaded successfully',
            image: imageUrl
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Error uploading file: ' + error.message });
    }
});

// ==================== SQL ANALYZER ROUTES ====================

// Execute SQL query with better error handling
app.post('/api/admin/database/query', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Query is required' });
        }

        const trimmedQuery = query.trim();
        const upperQuery = trimmedQuery.toUpperCase();
        
        // Execute query safely
        try {
            const [results] = await db.execute(trimmedQuery);
            
            res.json({
                success: true,
                results: results,
                rowCount: results.length || 0,
                message: `Query executed successfully. Returned ${results.length || 0} rows.`
            });
            
        } catch (dbError) {
            console.error('Database error:', dbError);
            
            // Provide more helpful error messages
            let userMessage = dbError.sqlMessage || 'Database error occurred';
            
            // Common error patterns
            if (userMessage.includes('Table') && userMessage.includes('doesn\'t exist')) {
                userMessage = 'Table not found. Check the table name and try again.';
            } else if (userMessage.includes('column') && userMessage.includes('unknown')) {
                userMessage = 'Column not found. Check your column names.';
            } else if (userMessage.includes('syntax')) {
                userMessage = 'SQL syntax error. Please check your query.';
            }
            
            res.status(400).json({ 
                error: userMessage,
                sqlError: dbError.sqlMessage
            });
        }
        
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: 'Internal server error. Please try again.'
        });
    }
});

// Get database schema for sidebar
app.get('/api/admin/database/schema-info', async (req, res) => {
    try {
        const [tables] = await db.execute(`
            SELECT TABLE_NAME as name, TABLE_ROWS as rowCount
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = 'VenuEase'
            ORDER BY TABLE_NAME
        `);
        
        // Get columns for each table
        const schemaInfo = await Promise.all(
            tables.map(async (table) => {
                const [columns] = await db.execute(`
                    SELECT 
                        COLUMN_NAME as name,
                        DATA_TYPE as type,
                        COLUMN_KEY as keyType
                    FROM information_schema.COLUMNS 
                    WHERE TABLE_SCHEMA = 'VenuEase' 
                    AND TABLE_NAME = ?
                    ORDER BY ORDINAL_POSITION
                `, [table.name]);
                
                return {
                    tableName: table.name,
                    rowCount: table.rowCount,
                    columns: columns
                };
            })
        );
        
        res.json(schemaInfo);
    } catch (error) {
        console.error('Schema fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch database schema' });
    }
});

// ==================== USER MANAGEMENT ROUTES ====================

app.get('/api/admin/users', async (req, res) => {
    try {
        const { search } = req.query;
        let query = `
            SELECT customer_ID, full_Name, email, phone, date_Created, is_Active 
            FROM CUSTOMERS 
        `;
        
        const params = [];
        
        if (search) {
            query += ` WHERE (full_Name LIKE ? OR email LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += ` ORDER BY full_Name`;
        
        const [customers] = await db.execute(query, params);
        res.json(customers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/admin/users/stats', async (req, res) => {
    try {
        const [activeUsers] = await db.execute(
            'SELECT COUNT(*) as count FROM CUSTOMERS WHERE is_Active = TRUE'
        );
        const [inactiveUsers] = await db.execute(
            'SELECT COUNT(*) as count FROM CUSTOMERS WHERE is_Active = FALSE'
        );
        const [totalUsers] = await db.execute(
            'SELECT COUNT(*) as count FROM CUSTOMERS'
        );
        const [recentUsers] = await db.execute(
            'SELECT COUNT(*) as count FROM CUSTOMERS WHERE date_Created >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
        );
        
        res.json({
            active: activeUsers[0].count,
            inactive: inactiveUsers[0].count,
            total: totalUsers[0].count,
            recent: recentUsers[0].count
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/admin/users/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { is_Active } = req.body;
        
        await db.execute(
            'UPDATE CUSTOMERS SET is_Active = ? WHERE customer_ID = ?',
            [is_Active, id]
        );
        
        const [updatedCustomer] = await db.execute(
            'SELECT customer_ID, full_Name, email, phone, date_Created, is_Active FROM CUSTOMERS WHERE customer_ID = ?',
            [id]
        );
        
        res.json({ 
            message: 'Customer status updated successfully',
            customer: updatedCustomer[0]
        });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== STAFF MANAGEMENT ROUTES ====================

app.get('/api/admin/staff', async (req, res) => {
    try {
        const [staff] = await db.execute(
            'SELECT admin_ID, full_Name, email, role, date_Created, is_Active FROM ADMIN ORDER BY role, date_Created DESC'
        );
        res.json(staff);
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/admin/create', async (req, res) => {
    const { full_Name, email, password, role } = req.body;

    if (!full_Name || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const [existing] = await db.execute('SELECT * FROM ADMIN WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Staff already exists with this email' });
        }

        const [result] = await db.execute(
            'INSERT INTO ADMIN (full_Name, email, password_Hash, role, is_Active) VALUES (?, ?, ?, ?, TRUE)',
            [full_Name, email, password, role]
        );

        res.status(201).json({ 
            message: 'Staff account created successfully',
            admin_ID: result.insertId
        });
    } catch (error) {
        console.error('Staff creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== ANALYTICS ROUTES ====================

app.get('/api/admin/stats', async (req, res) => {
    try {
        const [customers] = await db.execute('SELECT COUNT(*) as count FROM CUSTOMERS WHERE is_Active = TRUE');
        const [bookings] = await db.execute('SELECT COUNT(*) as count FROM BOOKING');
        const [venues] = await db.execute('SELECT COUNT(*) as count FROM VENUE');
        const [events] = await db.execute('SELECT COUNT(*) as count FROM EVENTS');

        res.json({
            totalCustomers: customers[0].count,
            totalBookings: bookings[0].count,
            totalVenues: venues[0].count,
            totalEvents: events[0].count || 0
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/admin/analytics', async (req, res) => {
    try {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        const [activeUsers] = await db.execute(
            'SELECT COUNT(*) as count FROM CUSTOMERS WHERE is_Active = TRUE'
        );
        
        const [registeredVenues] = await db.execute(
            'SELECT COUNT(*) as count FROM VENUE'
        );
        
        const [monthlyVisits] = await db.execute(`
            SELECT COUNT(DISTINCT customer_ID) as visits 
            FROM BOOKING 
            WHERE MONTH(booking_Date) = ? AND YEAR(booking_Date) = ?
        `, [currentMonth, currentYear]);
        
        const [totalBookings] = await db.execute(
            'SELECT COUNT(*) as count FROM BOOKING'
        );
        
        let avgVisits = monthlyVisits[0].visits;
        if (avgVisits === 0) {
            const [lastMonthVisits] = await db.execute(`
                SELECT COUNT(DISTINCT customer_ID) as visits 
                FROM BOOKING 
                WHERE MONTH(booking_Date) = ? AND YEAR(booking_Date) = ?
            `, [currentMonth - 1 || 12, currentYear - (currentMonth === 1 ? 1 : 0)]);
            avgVisits = lastMonthVisits[0].visits;
        }
        
        res.json({
            totalActiveUsers: activeUsers[0].count,
            registeredVenues: registeredVenues[0].count,
            avgMonthlyVisits: avgVisits || 157,
            totalBookings: totalBookings[0].count
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/admin/analytics/monthly-bookings', async (req, res) => {
    try {
        const [monthlyData] = await db.execute(`
            SELECT 
                DATE_FORMAT(booking_Date, '%b') as month,
                COUNT(*) as bookings,
                MONTH(booking_Date) as month_num
            FROM BOOKING
            WHERE YEAR(booking_Date) = YEAR(CURDATE())
            GROUP BY MONTH(booking_Date), DATE_FORMAT(booking_Date, '%b')
            ORDER BY month_num
        `);
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const completeData = months.map(month => {
            const found = monthlyData.find(item => item.month === month);
            return {
                month,
                bookings: found ? found.bookings : 0
            };
        });
        
        res.json(completeData);
    } catch (error) {
        console.error('Error fetching monthly bookings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== BOOKING ROUTES ====================

app.get('/api/admin/bookings/detailed', async (req, res) => {
    try {
        const [bookings] = await db.execute(`
            SELECT 
                b.booking_ID,
                c.full_Name as customer_name,
                c.email as customer_email,
                v.venue_Name,
                v.address,
                b.start_Time,
                b.end_Time,
                b.total_Guests,
                b.status,
                b.booking_Date,
                p.amount,
                p.payment_Method,
                p.payment_Status
            FROM BOOKING b
            LEFT JOIN CUSTOMERS c ON b.customer_ID = c.customer_ID
            LEFT JOIN VENUE v ON b.venue_ID = v.venue_ID
            LEFT JOIN PAYMENT p ON b.payment_ID = p.payment_ID
            ORDER BY b.booking_Date DESC
        `);
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/admin/bookings/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await db.execute(
            'UPDATE BOOKING SET status = ? WHERE booking_ID = ?',
            [status, id]
        );
        res.json({ message: 'Booking status updated successfully' });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/booking/create', async (req, res) => {
    const { customer_ID, venue_ID, start_Time, end_Time, total_Guests } = req.body;

    if (!customer_ID || !venue_ID || !start_Time || !end_Time || !total_Guests) {
        return res.status(400).json({ error: 'All booking fields are required' });
    }

    try {
        const [venue] = await db.execute('SELECT * FROM VENUE WHERE venue_ID = ? AND is_Available = TRUE', [venue_ID]);
        
        if (venue.length === 0) {
            return res.status(400).json({ error: 'Venue is not available' });
        }

        const [result] = await db.execute(
            'INSERT INTO BOOKING (customer_ID, venue_ID, start_Time, end_Time, total_Guests) VALUES (?, ?, ?, ?, ?)',
            [customer_ID, venue_ID, start_Time, end_Time, total_Guests]
        );

        res.status(201).json({ 
            message: 'Booking created successfully',
            booking_ID: result.insertId,
            status: 'pending'
        });

    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/payment/create', async (req, res) => {
    const { customer_ID, amount, payment_Method, booking_ID } = req.body;

    if (!customer_ID || !amount || !payment_Method || !booking_ID) {
        return res.status(400).json({ error: 'All payment fields are required' });
    }

    try {
        const [paymentResult] = await db.execute(
            'INSERT INTO PAYMENT (customer_ID, amount, payment_Method) VALUES (?, ?, ?)',
            [customer_ID, amount, payment_Method]
        );

        await db.execute(
            'UPDATE BOOKING SET payment_ID = ? WHERE booking_ID = ?',
            [paymentResult.insertId, booking_ID]
        );

        await db.execute(
            'UPDATE PAYMENT SET payment_Status = ? WHERE payment_ID = ?',
            ['completed', paymentResult.insertId]
        );

        await db.execute(
            'UPDATE BOOKING SET status = ? WHERE booking_ID = ?',
            ['confirmed', booking_ID]
        );

        res.status(201).json({ 
            message: 'Payment processed successfully',
            payment_ID: paymentResult.insertId,
            payment_Status: 'completed'
        });

    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== DEBUG/TEST ROUTES ====================

app.post('/api/test/json', (req, res) => {
    console.log('📤 Test JSON received:', req.body);
    console.log('📤 Content-Type:', req.get('Content-Type'));
    res.json({
        message: 'Test JSON received successfully',
        body: req.body,
        contentType: req.get('Content-Type')
    });
});

app.post('/api/test/upload', upload.single('testImage'), (req, res) => {
    console.log('📤 Test upload received:', req.file);
    res.json({
        message: 'Test upload successful',
        file: req.file
    });
});

// ==================== PUBLIC VENUE ROUTES (for user frontend) ====================

// Get all venues (for user frontend offers page)
app.get('/api/venues', async (req, res) => {
    try {
        console.log('📥 Fetching venues for frontend offers page...');
        
        // Query to get venues with their images
        const [venues] = await db.execute(`
            SELECT 
                v.venue_ID as id,
                v.venue_Name as title,
                v.address,
                v.capacity,
                v.price,
                v.contact_Email as contact_email,
                v.contact_Phone as contact_phone,
                v.description,
                v.is_Available as is_available,
                v.date_Created as created_at,
                v.images
            FROM VENUE v
            WHERE v.is_Available = 1
            ORDER BY v.date_Created DESC
        `);
        
        console.log(`✅ Found ${venues.length} venues for offers page`);
        
        // Format venues with proper image URLs
        const formattedVenues = venues.map(venue => {
            // Parse images from the images field
            const images = parseImagesField(venue.images);
            const mainImage = images.length > 0 ? 
                ensureImageUrl(images[0]) : 
                'https://via.placeholder.com/400x250?text=No+Image';
            
            return {
                id: venue.id,
                title: venue.title,
                address: venue.address,
                description: venue.description || 'No description available',
                price: parseFloat(venue.price),
                capacity: venue.capacity,
                contact_email: venue.contact_email,
                contact_phone: venue.contact_phone,
                is_available: venue.is_available,
                created_at: venue.created_at,
                image: mainImage,
                all_images: images.map(img => ensureImageUrl(img))
            };
        });
        
        res.json(formattedVenues);
    } catch (error) {
        console.error('❌ Error fetching venues for offers:', error);
        res.status(500).json({ 
            error: 'Failed to fetch venues',
            details: error.message 
        });
    }
});

// ==================== POPULAR VENUE ROUTE ====================

app.get('/api/venues/popular', async (req, res) => {
    try {
        console.log('🏆 Fetching popular venue...');
        
        // Get venue with most bookings
        const [popularVenue] = await db.execute(`
            SELECT 
                v.venue_ID,
                v.venue_Name,
                v.address,
                v.capacity,
                v.price,
                v.description,
                v.contact_Email,
                v.contact_Phone,
                v.is_Available,
                v.date_Created,
                COUNT(b.booking_ID) as booking_count,
                v.images
            FROM VENUE v
            LEFT JOIN BOOKING b ON v.venue_ID = b.venue_ID
            WHERE v.is_Available = 1
            GROUP BY v.venue_ID
            ORDER BY booking_count DESC
            LIMIT 1
        `);
        
        if (popularVenue.length === 0) {
            // Fallback: Get a random available venue if no bookings exist
            const [fallbackVenue] = await db.execute(`
                SELECT 
                    v.*
                FROM VENUE v
                WHERE v.is_Available = 1
                ORDER BY RAND()
                LIMIT 1
            `);
            
            if (fallbackVenue.length === 0) {
                return res.status(404).json({ 
                    error: 'No venues available' 
                });
            }
            
            const venue = fallbackVenue[0];
            const images = parseImagesField(venue.images);
            
            const mainImage = images.length > 0 ? 
                ensureImageUrl(images[0]) : 
                'https://via.placeholder.com/800x400?text=Venue+Image';
            
            const response = {
                id: venue.venue_ID,
                name: venue.venue_Name,
                address: venue.address,
                description: venue.description || 'A premium venue for your events',
                capacity: venue.capacity,
                price_per_hour: parseFloat(venue.price),
                contact_email: venue.contact_Email,
                contact_phone: venue.contact_Phone,
                location: venue.address.split(',')[0] || venue.address,
                is_available: venue.is_Available,
                image: mainImage,
                all_images: images.map(img => ensureImageUrl(img)),
                booking_count: 0,
                reason: 'Featured venue (no bookings yet)'
            };
            
            console.log(`✅ Returning fallback venue: ${response.name}`);
            return res.json(response);
        }
        
        const venue = popularVenue[0];
        const images = parseImagesField(venue.images);
        
        const mainImage = images.length > 0 ? 
            ensureImageUrl(images[0]) : 
            'https://via.placeholder.com/800x400?text=Venue+Image';
        
        const response = {
            id: venue.venue_ID,
            name: venue.venue_Name,
            address: venue.address,
            description: venue.description || 'A premium venue for your events',
            capacity: venue.capacity,
            price_per_hour: parseFloat(venue.price),
            contact_email: venue.contact_Email,
            contact_phone: venue.contact_Phone,
            location: venue.address.split(',')[0] || venue.address,
            is_available: venue.is_Available,
            image: mainImage,
            all_images: images.map(img => ensureImageUrl(img)),
            booking_count: venue.booking_count || 0,
            reason: 'Most booked venue'
        };
        
        console.log(`✅ Popular venue found: ${response.name} (${response.booking_count} bookings)`);
        res.json(response);
        
    } catch (error) {
        console.error('❌ Error fetching popular venue:', error);
        res.status(500).json({ 
            error: 'Failed to fetch popular venue',
            details: error.message 
        });
    }
});

// Get venue by ID for details page
app.get('/api/venues/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📥 Fetching venue ID: ${id}`);
        
        const [venues] = await db.execute(`
            SELECT * FROM VENUE WHERE venue_ID = ? AND is_Available = 1
        `, [id]);
        
        if (venues.length === 0) {
            return res.status(404).json({ error: 'Venue not found or not available' });
        }
        
        const venue = venues[0];
        const images = parseImagesField(venue.images);
        
        const formattedVenue = {
            id: venue.venue_ID,
            title: venue.venue_Name,
            address: venue.address,
            description: venue.description || 'No description available',
            price: parseFloat(venue.price),
            capacity: venue.capacity,
            contact_email: venue.contact_Email,
            contact_phone: venue.contact_Phone,
            is_available: venue.is_Available,
            created_at: venue.date_Created,
            images: images.map(img => ensureImageUrl(img)),
            main_image: images.length > 0 ? 
                ensureImageUrl(images[0]) : 
                'https://via.placeholder.com/400x250?text=No+Image'
        };
        
        res.json(formattedVenue);
    } catch (error) {
        console.error('❌ Error fetching venue:', error);
        res.status(500).json({ 
            error: 'Failed to fetch venue',
            details: error.message 
        });
    }
});

// ==================== UPDATE ADMIN VENUE ROUTES ====================

// Update your existing POST /api/admin/venues route to also save to venue_images table
app.post('/api/admin/venues', async (req, res) => {
    try {
        console.log('📥 Creating venue with data:', req.body);
        
        const { 
            venue_Name, 
            address, 
            capacity, 
            price, 
            contact_Email, 
            contact_Phone, 
            description,
            images 
        } = req.body;

        // Validate required fields
        if (!venue_Name || !address || !capacity || !price) {
            return res.status(400).json({ 
                error: 'Name, address, capacity, and price are required'
            });
        }

        // Parse images using helper function
        const imagesArray = parseImagesField(images);
        console.log('🖼️ Parsed images array:', imagesArray);

        // Prepare images for storage
        let imagesForDB = null;
        if (imagesArray.length > 0) {
            imagesForDB = JSON.stringify(imagesArray);
        }

        const [result] = await db.execute(
            `INSERT INTO VENUE 
                (venue_Name, address, capacity, price, contact_Email, contact_Phone, description, images, is_Available) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [
                venue_Name, 
                address, 
                parseInt(capacity), 
                parseFloat(price), 
                contact_Email || null, 
                contact_Phone || null, 
                description || null,
                imagesForDB
            ]
        );

        // Get the newly created venue
        const [newVenue] = await db.execute(
            'SELECT * FROM VENUE WHERE venue_ID = ?',
            [result.insertId]
        );

        const venueWithImages = {
            ...newVenue[0],
            images: parseImagesField(newVenue[0].images)
        };

        res.status(201).json({
            message: 'Venue created successfully',
            venue: venueWithImages
        });
    } catch (error) {
        console.error('❌ Error creating venue:', error);
        res.status(500).json({ 
            error: 'Internal server error: ' + error.message,
            sqlMessage: error.sqlMessage
        });
    }
});

// Also update your PUT /api/admin/venues/:id route similarly to handle venue_images table
app.put('/api/admin/venues/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('📝 Updating venue:', id, req.body);

        // Check if venue exists
        const [existing] = await db.execute(
            'SELECT venue_ID FROM VENUE WHERE venue_ID = ?',
            [id]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Venue not found' });
        }

        const { 
            venue_Name, 
            address, 
            capacity, 
            price, 
            contact_Email, 
            contact_Phone, 
            description,
            images,
            is_Available 
        } = req.body;

        // Parse images using helper function
        const imagesArray = parseImagesField(images);
        let imagesForDB = null;
        if (imagesArray.length > 0) {
            imagesForDB = JSON.stringify(imagesArray);
        }

        // Update venue
        await db.execute(
            `UPDATE VENUE SET 
                venue_Name = ?,
                address = ?,
                capacity = ?,
                price = ?,
                contact_Email = ?,
                contact_Phone = ?,
                description = ?,
                images = ?,
                is_Available = ?
            WHERE venue_ID = ?`,
            [
                venue_Name, 
                address, 
                parseInt(capacity), 
                parseFloat(price), 
                contact_Email || null, 
                contact_Phone || null, 
                description || null,
                imagesForDB,
                is_Available !== undefined ? is_Available : true,
                id
            ]
        );

        // Get updated venue
        const [updatedVenue] = await db.execute(
            'SELECT * FROM VENUE WHERE venue_ID = ?',
            [id]
        );

        const venueWithImages = {
            ...updatedVenue[0],
            images: parseImagesField(updatedVenue[0].images)
        };

        res.json({
            message: 'Venue updated successfully',
            venue: venueWithImages
        });
    } catch (error) {
        console.error('Error updating venue:', error);
        res.status(500).json({ 
            error: 'Internal server error: ' + error.message
        });
    }
});

// ==================== ERROR HANDLING ====================

app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error('🔥 Global error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// ==================== SERVER START ====================

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public', 'uploads', 'venues');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`📁 Created uploads directory: ${uploadsDir}`);
}

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Static files: http://localhost:${PORT}/uploads/`);
    console.log(`📁 Uploads directory: ${uploadsDir}`);
});

// Debug endpoint to check uploaded files
app.get('/api/debug/uploads', (req, res) => {
    const uploadsDir = path.join(__dirname, 'public', 'uploads', 'venues');
    
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.json({ 
                error: 'Cannot read uploads directory',
                message: err.message 
            });
        }
        
        res.json({
            uploadsDirectory: uploadsDir,
            totalFiles: files.length,
            files: files.map(file => ({
                name: file,
                path: `/uploads/venues/${file}`,
                fullUrl: `http://localhost:5000/uploads/venues/${file}`
            }))
        });
    });
});

// Test image upload endpoint
app.post('/api/test/upload-debug', upload.single('image'), (req, res) => {
    try {
        console.log('🔍 Debug upload test');
        console.log('File:', req.file);
        console.log('File path:', req.file.path);
        console.log('File filename:', req.file.filename);
        
        const imageUrl = `/uploads/venues/${req.file.filename}`;
        
        res.json({
            success: true,
            message: 'File uploaded successfully',
            file: req.file,
            imageUrl: imageUrl,
            fullUrl: `http://localhost:5000${imageUrl}`
        });
    } catch (error) {
        console.error('Debug upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// List all uploaded files
app.get('/api/uploads/list', (req, res) => {
    const uploadsDir = path.join(__dirname, 'public', 'uploads', 'venues');
    
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ 
                error: 'Cannot read uploads directory',
                message: err.message 
            });
        }
        
        const fileDetails = files.map(file => {
            const filePath = path.join(uploadsDir, file);
            const stats = fs.statSync(filePath);
            return {
                name: file,
                size: stats.size,
                created: stats.birthtime,
                url: `/uploads/venues/${file}`,
                fullUrl: `http://localhost:5000/uploads/venues/${file}`
            };
        });
        
        res.json({
            directory: uploadsDir,
            totalFiles: files.length,
            files: fileDetails
        });
    });
});