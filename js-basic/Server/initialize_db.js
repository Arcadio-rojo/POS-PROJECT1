// initialize_db.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('../all/Employee-system/attendance-system/database/attendance.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// SQL statement to create attendance_records table
const sql = `
CREATE TABLE IF NOT EXISTS attendance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_email TEXT NOT NULL,
    date TEXT NOT NULL,
    time_in TEXT,
    time_out TEXT,
    status TEXT
);
`;

db.run(sql, (err) => {
    if (err) {
        console.error('Error creating table', err.message);
    } else {
        console.log('attendance_records table created or already exists');
    }
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing database', err.message);
    }
});
