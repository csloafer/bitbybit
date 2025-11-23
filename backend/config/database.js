const mysql = require('mysql2');

// Create connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1439',
    database: 'VenuEase',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ DATABASE CONNECTION FAILED:', err.message);
        console.log('💡 Make sure:');
        console.log('   1. MySQL is running (XAMPP/WAMP)');
        console.log('   2. Database "VenuEase" exists');
        console.log('   3. MySQL username/password is correct');
        return;
    }
    console.log('✅ DATABASE CONNECTED: VenuEase');
    connection.release();
});

module.exports = pool.promise();