const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = 'C:\\Users\\salve\\Downloads\\js-basic\\js-basic\\all\\Employee-system\\attendance-system\\database\\attendance.db';

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to attendance.db\n');
});

// Get all tables and their schemas
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
        console.error('Error getting tables:', err.message);
        return;
    }
    
    console.log('📊 Tables found:', tables.map(t => t.name).join(', '));
    console.log('\n' + '='.repeat(60) + '\n');
    
    let completedQueries = 0;
    
    // Query each table
    tables.forEach(table => {
        db.all(`SELECT * FROM ${table.name}`, (err, rows) => {
            if (err) {
                console.error(`Error reading ${table.name}:`, err.message);
            } else {
                console.log(`📋 TABLE: ${table.name.toUpperCase()}`);
                console.log(`   Records: ${rows.length}`);
                if (rows.length > 0) {
                    console.table(rows);
                } else {
                    console.log('   (Empty table)');
                }
                console.log('\n');
            }
            
            completedQueries++;
            if (completedQueries === tables.length) {
                db.close();
            }
        });
    });
});
