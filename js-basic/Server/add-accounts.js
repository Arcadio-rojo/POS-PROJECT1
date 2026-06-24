const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const dbPath = 'C:\\Users\\salve\\Downloads\\js-basic\\js-basic\\all\\Employee-system\\attendance-system\\database\\attendance.db';

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('✅ Connected to attendance.db\n');
    
    // Drop existing table if it exists
    db.run('DROP TABLE IF EXISTS users', (err) => {
        if (err) console.error('Error dropping table:', err.message);
        else console.log('🔄 Dropped old users table\n');
        createUsersTable();
    });
});

function createUsersTable() {
    const createTableSQL = `
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    `;

    db.run(createTableSQL, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
            db.close();
            return;
        }
        console.log('📋 Users table created\n');
        addAccounts();
    });
}

function addAccounts() {
    // Hash passwords
    const adminPassword = bcrypt.hashSync('admin123', 10);
    const employeePassword = bcrypt.hashSync('employee123', 10);
    
    // Insert Admin Account
    const adminSQL = `INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)`;
    
    db.run(adminSQL, ['admin@company.com', adminPassword, 'Admin User', 'admin'], (err) => {
        if (err) {
            console.error('Error inserting admin:', err.message);
        } else {
            console.log('✅ Admin account added:');
            console.log('   Email: admin@company.com');
            console.log('   Password: admin123');
            console.log('   Role: admin\n');
        }
    });
    
    // Insert Employee Accounts
    const employees = [
        { email: 'john@company.com', name: 'John Doe' },
        { email: 'jane@company.com', name: 'Jane Smith' },
        { email: 'mike@company.com', name: 'Mike Johnson' }
    ];
    
    employees.forEach(emp => {
        db.run(adminSQL, [emp.email, employeePassword, emp.name, 'employee'], (err) => {
            if (err) {
                console.error(`Error inserting ${emp.name}:`, err.message);
            } else {
                console.log(`✅ Employee account added: ${emp.name} (${emp.email})`);
            }
        });
    });
    
    // Display all users after 1 second
    setTimeout(() => {
        console.log('\n' + '='.repeat(60));
        console.log('📊 ALL USER ACCOUNTS:\n');
        
        db.all('SELECT id, email, name, role, created_at FROM users', (err, rows) => {
            if (err) {
                console.error('Error reading users:', err.message);
            } else {
                console.table(rows);
            }
            db.close();
        });
    }, 1000);
}
