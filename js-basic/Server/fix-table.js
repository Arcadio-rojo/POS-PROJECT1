const sqlite3 = require('sqlite3').verbose();

const dbPath = 'C:\\Users\\salve\\Downloads\\js-basic\\js-basic\\all\\Employee-system\\attendance-system\\database\\attendance.db';

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('✅ Connected to database\n');
});

// Add is_active column if it doesn't exist
db.run(`ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 0`, (err) => {
    if (err) {
        if (err.message.includes('duplicate column')) {
            console.log('✅ Column is_active already exists');
        } else {
            console.error('Error adding column:', err.message);
        }
    } else {
        console.log('✅ Added is_active column to users table');
    }
    
    // Display table structure
    db.all("PRAGMA table_info(users)", (err, rows) => {
        if (err) {
            console.error('Error reading table structure:', err.message);
        } else {
            console.log('\n📋 Users table structure:');
            console.table(rows);
        }
        db.close();
    });
});
