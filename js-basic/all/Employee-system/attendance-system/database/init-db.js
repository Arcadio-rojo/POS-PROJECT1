const sqlite3 = require('sqlite3').verbose();

// Function to create the attendance table
function createAttendanceTable() {
    const attendanceDb = new sqlite3.Database('attendance.db', (err) => {
        if (err) {
            return console.error('Error opening attendance database:', err.message);
        }
        console.log('Connected to attendance database');
    });

    const createAttendanceTableSQL = `
    CREATE TABLE IF NOT EXISTS attendance_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_email TEXT NOT NULL,
        date TEXT NOT NULL,
        time_in TEXT,
        time_out TEXT,
        status TEXT DEFAULT 'Absent'
    );`;

    attendanceDb.run(createAttendanceTableSQL, (err) => {
        if (err) {
            console.error('Error creating attendance table:', err.message);
        } else {
            console.log('Attendance records table created or already exists.');
        }
    });

    // Close attendance database after creating the table
    attendanceDb.close((err) => {
        if (err) {
            console.error('Error closing attendance database:', err.message);
        } else {
            console.log('Attendance database connection closed.');
        }
    });
}

// Function to create the products table
function createProductsTable() {
    const productsDb = new sqlite3.Database('products.db', (err) => {
        if (err) {
            return console.error('Error opening products database:', err.message);
        }
        console.log('Connected to products database');
    });

    const createProductsTableSQL = `
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT NOT NULL,
        category TEXT,
        total_item INTEGER,
        total_amount REAL,
        date TEXT,
        time TEXT
    );`;

    productsDb.run(createProductsTableSQL, (err) => {
        if (err) {
            console.error('Error creating products table:', err.message);
        } else {
            console.log('Products table created or already exists.');
        }
    });

    // Close products database after creating the table
    productsDb.close((err) => {
        if (err) {
            console.error('Error closing products database:', err.message);
        } else {
            console.log('Products database connection closed.');
        }
    });
}

// Create both tables
createAttendanceTable(); 
createProductsTable();
