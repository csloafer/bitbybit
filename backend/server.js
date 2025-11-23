const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./config/database');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'VenuEase Server is running!' });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
    try {
        const [results] = await db.execute('SELECT 1 + 1 AS result');
        const [admins] = await db.execute('SELECT COUNT(*) as count FROM ADMIN');
        res.json({ 
            message: 'Database connected successfully',
            testResult: results[0].result,
            adminCount: admins[0].count,
            status: 'OK'
        });
    } catch (error) {
        res.status(500).json({ error: 'Database connection failed: ' + error.message });
    }
});

// CUSTOMER REGISTRATION - DEBUG VERSION
app.post('/api/customer/register', async (req, res) => {
    console.log('🔔 REGISTRATION REQUEST RECEIVED');
    console.log('📦 Request body:', req.body);
    
    const { full_Name, email, password, phone } = req.body;

    // Validate required fields
    if (!full_Name || !email || !password) {
        console.log('❌ Missing fields:', { full_Name, email, password: !!password });
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        console.log('🔍 Step 1: Checking database connection...');
        
        // Test database connection first
        const [dbTest] = await db.execute('SELECT 1');
        console.log('✅ Database connection OK');

        console.log('🔍 Step 2: Checking if customer exists...');
        const [existingCustomers] = await db.execute(
            'SELECT * FROM CUSTOMERS WHERE email = ?', 
            [email]
        );

        if (existingCustomers.length > 0) {
            console.log('❌ Customer already exists with email:', email);
            return res.status(400).json({ error: 'Customer already exists with this email' });
        }

        console.log('✅ Email is available');

        console.log('🔍 Step 3: Hashing password...');
        const saltRounds = 10;
        const password_Hash = await bcrypt.hash(password, saltRounds);
        console.log('✅ Password hashed');

        console.log('🔍 Step 4: Inserting into database...');
        console.log('📝 Insert data:', { full_Name, email, password_Hash: '***', phone });
        
        const [result] = await db.execute(
            'INSERT INTO CUSTOMERS (full_Name, email, password_Hash, phone) VALUES (?, ?, ?, ?)',
            [full_Name, email, password_Hash, phone || null]
        );

        console.log('✅ Database insert successful. ID:', result.insertId);
        
        res.status(201).json({ 
            message: 'Customer registered successfully',
            customer_ID: result.insertId,
            full_Name: full_Name,
            email: email
        });

    } catch (error) {
        console.error('❌ REGISTRATION ERROR:', error);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage
        });
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

// CUSTOMER LOGIN
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
                role: 'customer',
                userType: 'customer'
            }
        });

    } catch (error) {
        console.error('Customer login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ADMIN/STAFF LOGIN (with plain text passwords for testing)
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('🔐 Admin login attempt:', { email, password });

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const [admins] = await db.execute(
            'SELECT admin_ID, full_Name, email, password_Hash, role FROM ADMIN WHERE email = ?', 
            [email]
        );

        console.log('📊 Found admins:', admins.length);

        if (admins.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const admin = admins[0];
        
        // TEMPORARY: Plain text comparison for testing
        const isPasswordValid = password === admin.password_Hash;
        console.log('🔑 Password valid:', isPasswordValid);
        
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        console.log('✅ Login successful for:', admin.email);
        
        res.json({ 
            message: 'Login successful',
            user: {
                user_ID: admin.admin_ID,
                full_Name: admin.full_Name,
                email: admin.email,
                role: admin.role,
                userType: 'admin'
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET ALL CUSTOMERS (Admin only)
app.get('/api/admin/customers', async (req, res) => {
    try {
        const [customers] = await db.execute(
            'SELECT customer_ID, full_Name, email, phone, date_Created, is_Active FROM CUSTOMERS ORDER BY date_Created DESC'
        );
        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET ALL STAFF (Admin only)
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

// CREATE NEW STAFF (Admin only)
app.post('/api/admin/staff', async (req, res) => {
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
            'INSERT INTO ADMIN (full_Name, email, password_Hash, role) VALUES (?, ?, ?, ?)',
            [full_Name, email, password, role] // Plain text for testing
        );

        res.status(201).json({ 
            message: 'Staff account created successfully',
            admin_ID: result.insertId,
            full_Name: full_Name,
            email: email,
            role: role
        });

    } catch (error) {
        console.error('Staff creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET ALL VENUES
app.get('/api/admin/venues', async (req, res) => {
    try {
        const [venues] = await db.execute('SELECT * FROM VENUE ORDER BY venue_Name');
        res.json(venues);
    } catch (error) {
        console.error('Error fetching venues:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// CREATE VENUE
app.post('/api/admin/venues', async (req, res) => {
    const { venue_Name, address, capacity } = req.body;

    if (!venue_Name || !address || !capacity) {
        return res.status(400).json({ error: 'Venue name, address, and capacity are required' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO VENUE (venue_Name, address, capacity) VALUES (?, ?, ?)',
            [venue_Name, address, capacity]
        );

        res.status(201).json({ 
            message: 'Venue created successfully',
            venue_ID: result.insertId,
            venue_Name: venue_Name
        });

    } catch (error) {
        console.error('Error creating venue:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET ALL EVENTS
app.get('/api/admin/events', async (req, res) => {
    try {
        const [events] = await db.execute('SELECT * FROM EVENTS ORDER BY event_Date DESC');
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET ALL BOOKINGS
app.get('/api/admin/bookings', async (req, res) => {
    try {
        const [bookings] = await db.execute(`
            SELECT b.booking_ID, c.full_Name, v.venue_Name, e.event_Name, 
                   b.start_Time, b.end_Time, b.status
            FROM BOOKING b
            JOIN CUSTOMERS c ON b.customer_ID = c.customer_ID
            JOIN VENUE v ON b.venue_ID = v.venue_ID
            JOIN EVENTS e ON b.event_ID = e.event_ID
            ORDER BY b.booking_Date DESC
        `);
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});