const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../all/Employee-system/attendance-system/database/attendance.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to attendance.db\n');
});

// Get all tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
        console.error('Error getting tables:', err.message);
        return;
    }
    
    console.log('📊 Tables in database:', tables.map(t => t.name).join(', '));
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Query attendance_records
    db.all("SELECT * FROM attendance_records", (err, rows) => {
        if (err) {
            console.error('Error reading data:', err.message);
            db.close();
            return;
        }
        
        console.log('📋 ATTENDANCE RECORDS:');
        if (rows.length === 0) {
            console.log('No records found');
        } else {
            console.table(rows);
        }
        
        db.close();
    });
});
