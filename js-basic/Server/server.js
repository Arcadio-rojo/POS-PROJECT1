const nodemailer = require("nodemailer");
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcrypt');

// Your other required modules and code


const app = express();
const port = process.env.PORT || 3000; // Default to 3000 if not set
app.use(cors());
app.use(cors({
    origin: ['http://localhost:5500', 'http://192.168.100.184:5500'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../')));
app.use(express.static('public'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


// Security middleware
app.use(helmet());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

// Enhanced error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
 
// Middleware to parse JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));




// Serve static files for uploaded images
const imageDirectory = path.join(__dirname, '../all/Employee-system/Transaction/Pictures');
app.use('/pictures', (req, res, next) => {
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    next();
}, express.static(imageDirectory));
// Temporary in-memory storage for products
const products = [];

// Endpoint to upload a product
app.post('/upload-product', (req, res) => {
    const { name, image, ingredients } = req.body;

    if (!name || !image) {
        return res.status(400).send({ message: 'Product name and image are required.' });
    }

    // Sanitize product name and create fileName here
    const sanitizedFileName = name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    const fileName = `${sanitizedFileName}.png`;
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const filePath = path.join(imageDirectory, fileName);
    
    fs.writeFile(filePath, buffer, (err) => {
        if (err) {
            console.error('Error saving image:', err);
            return res.status(500).send({ message: 'Error saving image to server.' });
        }

        const publicURL = `http://localhost:3000/pictures/${fileName}`;
        console.log('Image saved successfully:', filePath);

        const product = { name, imageURL: publicURL, ingredients };
        products.push(product);

        res.send({ message: 'Product uploaded successfully!', publicURL });
    });
});



const productData = {
    'Burgers': [
        { name: 'Classic Burger', price: 39, ingredients: { Buns: 0, Patties: 0}},
        { name: 'Egg Sandwich', price: 45, ingredients: { Buns: 0, Egg: 0 }},
        { name: 'Cheese Burger', price: 49, ingredients: { Buns: 0, Patties: 0, Cheese: 0 }},
        { name: 'Ham Sandwich', price: 45, ingredients: { Buns: 0, 'Ham/Bacon': 0, Cheese: 0 }},
        { name: 'Chicken Sandwich', price: 45, ingredients: { Buns: 0, Chicken: 0, Cheese: 0, Cabbage: 0 }}
    ],
    'Hotdog Sandwich': [
        { name: 'Hotdog Sandwich', price: 49, ingredients: { Hotdog: 0, 'Hotdog Buns': 0 }},
        { name: 'Footlong', price: 50, ingredients: { 'Footlong Buns': 0, Footlong: 0 }},
        { name: 'Hungarian Sandwich', price: 60, ingredients: { 'Footlong Buns': 0, Hungarian: 0 }}
    ],
    'Fries': [
        { name: 'Small Fries', price: 20, ingredients: { Potato: 0, 'Flavored Powder': 0 }},
        { name: 'Medium Fries', price: 30, ingredients: { Potato: 0, 'Flavored Powder': 0 }},
        { name: 'Large Fries', price: 40, ingredients: { Potato: 0, 'Flavored Powder': 0 }},
        { name: 'Barkada Fries', price: 60, ingredients: { Potato: 0, 'Flavored Powder': 0 }},
        { name: 'Fries with Drinks', price: 45, ingredients: { Potato: 0, 'Flavored Powder': 0, 'Juice Powder': 0 }}
    ],
    'Nuggets': [
        { name: 'Chicken Nuggets', price: 59, ingredients: { 'Raw Chicken Nuggets': 0 }},
        { name: 'Chicken Pop', price: 59, ingredients: { 'Raw Chicken Pop': 0 }},
        { name: 'Fish Fillet', price: 59, ingredients: { 'Raw Fish Fillet': 0 }}
    ],
    'Fried Noodles': [
        { name: 'Plain Fried Noodles', price: 35, ingredients: { Noodles: 0 }},
        { name: 'Fried Noodles w/ 2 siomai', price: 45, ingredients: { Noodles: 0, 'Siomai': 0 }},
        { name: 'Fried Noodles w/ 2 siomai & Egg', price: 60, ingredients: { Noodles: 0, 'Siomai': 0, Egg: 0 }}
    ],
    'Other': [
        { name: 'Cheese', price: 10, ingredients: { Cheese: 0 }},
        { name: 'Egg', price: 15, ingredients: { Egg: 0 }},
        { name: 'Bacon', price: 15, ingredients: { Bacon: 0 }},
        { name: 'Coleslaw', price: 10, ingredients: { Coleslaw: 0 }},
        { name: 'Small Siomai', price: 5, ingredients: { 'Siomai': 0 }},
        { name: 'Shanghai', price: 8, ingredients: { Shanghai: 0 }}
    ]
};


// Connect to attendance.db for attendance-related functions


// Define paths to your database files
const attendanceDbPath = path.join(__dirname, '../all/Employee-system/attendance-system/database/attendance.db');
const productsDbPath = path.join(__dirname, '../all/Employee-system/attendance-system/database/products.db');
//const dbPath = path.join(__dirname, '../all/Employee-system/attendance-system/database/InventoryAdmin.db');
// Add these configurations at the top of your database connections
const adduserDb = new sqlite3.Database(attendanceDbPath);
const CalDb = new sqlite3.Database(attendanceDbPath);
const SalesDb = new sqlite3.Database(productsDbPath);


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../all/Employee-system/Transaction/Pictures/Pics_burger'));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

app.get('/api/products', (req, res) => {
    const query = `
        SELECT 
            product_name,
            category,
            total_item,
            total_amount,
            date,
            image_path
        FROM products 
        ORDER BY date DESC, product_name
    `;

    productsDb.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ products: rows });
    });
});

const upload = multer({ storage: storage });

app.post('/api/products', upload.single('image'), (req, res) => {
    const {
        name,
        category,
        ingredients,
        total_item,
        total_amount,
        transaction_id,
        date
    } = req.body;

    const imagePath = req.file ? req.file.filename : null;

    const sql = `
        INSERT INTO products (
            product_name,
            category,
            total_item,
            total_amount,
            date,
            transaction_id,
            image_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    productsDb.run(sql, [
        name,
        category,
        total_item,
        total_amount,
        date,
        transaction_id,
        imagePath
    ], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to add product' });
        }
        
        res.json({
            success: true,
            id: this.lastID,
            message: 'Product added successfully'
        });
    });
});



const picDb = new sqlite3.Database(productsDbPath);

// Modified upload endpoint
app.post('/upload-product', (req, res) => {
    const { name, category, ingredients, image, price } = req.body;
    
    const sanitizedFileName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${sanitizedFileName}.png`;
    const filePath = path.join(uploadConfig.imageDirectory, fileName);
    
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    fs.writeFile(filePath, buffer, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to save image' });
        }

        picDb.run(
            'INSERT INTO product_items (name, category, price, image) VALUES (?, ?, ?, ?)',
            [name, category, price, fileName],
            function(err) {
                if (err) {
                    return res.status(500).json({ message: 'Database error' });
                }

                const productId = this.lastID;
                const stmt = picDb.prepare('INSERT INTO product_ingredients (product_id, ingredient_name, quantity) VALUES (?, ?, ?)');
                
                Object.entries(ingredients).forEach(([name, quantity]) => {
                    stmt.run([productId, name, quantity]);
                });
                stmt.finalize();

                res.json({
                    message: 'Product added successfully',
                    productId,
                    publicURL: `http://localhost:3000/pictures/${fileName}`
                });
            }
        );
    });
});

app.get('/get-products', (req, res) => {
    picDb.all(`
        SELECT p.*, GROUP_CONCAT(pi.ingredient_name || ':' || pi.quantity) as ingredients
        FROM product_items p
        LEFT JOIN product_ingredients pi ON p.id = pi.product_id
        GROUP BY p.id
    `, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        const products = rows.map(row => ({
            id: row.id,
            name: row.name,
            category: row.category,
            price: row.price,
            image: row.image,
            ingredients: row.ingredients ? Object.fromEntries(
                row.ingredients.split(',').map(pair => {
                    const [name, quantity] = pair.split(':');
                    return [name, parseInt(quantity)];
                })
            ) : {}
        }));

        res.json(products);
    });
});


app.get('/api/monthly-sales', (req, res) => {
    const query = `
        SELECT 
            strftime('%m', date) as month,
            SUM(total_item) as total_items,
            SUM(total_amount) as total_sales,
            ROUND(SUM(total_amount) * 100.0 / (SELECT SUM(total_amount) FROM products), 2) as sales_rate
        FROM products 
        GROUP BY strftime('%m', date)
        ORDER BY month`;

    SalesDb.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});
// Create events table
CalDb.run(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    start TEXT NOT NULL,
    end TEXT,
    allDay INTEGER
  )
`);

// Get all events
app.get('/events', (req, res) => {
  CalDb.all('SELECT * FROM events', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new event
app.post('/events', (req, res) => {
  const { title, start, end, allDay } = req.body;
  CalDb.run(
    'INSERT INTO events (title, start, end, allDay) VALUES (?, ?, ?, ?)',
    [title, start, end, allDay],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, ...req.body });
    }
  );
});

// Delete event
app.delete('/events/:id', (req, res) => {
  CalDb.run(
    'DELETE FROM events WHERE id = ?',
    [req.params.id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Event deleted' });
    }
  );
});


// Connect to attendance.db
// Initialize database connections
// Single database connections with proper configuration
const attendanceDb = new sqlite3.Database(attendanceDbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening attendance database:', err.message);
    } else {
        console.log('Connected to attendance database');
    }
});

const productsDb = new sqlite3.Database(productsDbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening products database:', err.message);
    } else {
        console.log('Connected to products database');
    }
});



// Configure both databases
attendanceDb.configure("busyTimeout", 5000);
productsDb.configure("busyTimeout", 5000);

// Enable WAL mode for better concurrency
attendanceDb.run("PRAGMA journal_mode = WAL");
productsDb.run("PRAGMA journal_mode = WAL");

// Set synchronous mode for better performance
attendanceDb.run("PRAGMA synchronous = NORMAL");
productsDb.run("PRAGMA synchronous = NORMAL");

// Handle graceful shutdown
process.on('SIGINT', () => {
    attendanceDb.close();
    productsDb.close();
    process.exit(0);
});



// Attendance functions

// Schedule a job to mark absentees at 11:59 PM every day
cron.schedule('59 23 * * *', () => {
    const date = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY format
    const employeeQuery = `SELECT email FROM employees`; // Fixed with backticks
    
    attendanceDb.all(employeeQuery, [], (err, employees) => {
        if (err) {
            return console.error('Error retrieving employees:', err.message);
        }
        employees.forEach(employee => {
            const checkAttendanceQuery = `SELECT * FROM attendance_records WHERE employee_email = ? AND date = ?`; // Fixed with backticks
            attendanceDb.get(checkAttendanceQuery, [employee.email, date], (err, record) => {
                if (err) {
                    return console.error('Error checking attendance:', err.message);
                }
                if (!record) {
                    const insertAbsentQuery = `INSERT INTO attendance_records (employee_email, date, status) VALUES (?, ?, 'Absent')`; // Fixed with backticks
                    attendanceDb.run(insertAbsentQuery, [employee.email, date], err => {
                        if (err) {
                            return console.error('Error marking absent:', err.message);
                        }
                        console.log(`Marked ${employee.email} as Absent for ${date}`); // Fixed with backticks
                    });
                }
            });
        });
    });
});

let activeSessions = new Map();

router.post('/api/login-status', (req, res) => {
    const { email } = req.body;
    
    // Increment session count for this email
    const currentCount = activeSessions.get(email) || 0;
    activeSessions.set(email, currentCount + 1);
    
    // Update database
    db.run(
        'UPDATE attendance_records SET is_active = 1 WHERE employee_email = ? AND date = date("now")',
        [email]
    );
    
    res.json({ 
        success: true, 
        activeCount: activeSessions.size,
        userSessions: activeSessions.get(email)
    });
});

// Get active count
router.get('/api/active-count', (req, res) => {
    res.json({ 
        activeCount: activeSessions.size,
        activeUsers: Array.from(activeSessions.keys())
    });
});

// Update active status
router.put('/api/attendance/active-status', async (req, res) => {
    const { email, is_active } = req.body;
    try {
        await db.run(
            'UPDATE attendance_records SET is_active = ? WHERE employee_email = ? AND date = date("now")',
            [is_active ? 1 : 0, email]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// When user logs in
router.post('/api/login', async (req, res) => {
    // Your existing login logic here
    // After successful login:
    await updateActiveStatus(req.body.email, 1);
});

// When user logs out
router.post('/api/logout', async (req, res) => {
    // Your existing logout logic here
    // Before completing logout:
    await updateActiveStatus(req.body.email, 0);
});


router.get('/active-users', async (req, res) => {
    try {
        const result = await db.all(
            'SELECT COUNT(*) as count FROM attendance_records WHERE is_active = 1 AND date = date("now")'
        );
        res.json({ activeCount: result[0].count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update active status on login
router.post('/login-status', async (req, res) => {
    const { email } = req.body;
    try {
        await db.run(
            'UPDATE attendance_records SET is_active = 1 WHERE employee_email = ? AND date = date("now")',
            [email]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.use('/', router);


app.post('/log-time-in', (req, res) => {
    const { email, timeIn } = req.body;
    const date = new Date().toLocaleDateString('en-GB');
    
    const sql = `
        INSERT OR REPLACE INTO attendance_records 
        (employee_email, date, time_in, status, is_active)
        VALUES (?, ?, ?, ?, 1)
    `;
    
    const status = determineStatus(timeIn);
    
    attendanceDb.run(sql, [email, date, timeIn, status], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error logging time-in' });
        }
        res.json({ message: 'Time-in logged successfully', status });
    });
});

function determineStatus(timeIn) {
    const [time, modifier] = timeIn.split(' ');
    let [hour, minute] = time.split(':').map(Number);
    
    if (modifier === 'PM' && hour < 12) hour += 12;
    if (modifier === 'AM' && hour === 12) hour = 0;
    
    if (hour < 7 || (hour === 7 && minute === 0)) {
        return 'Present';
    } else if ((hour > 7 || (hour === 7 && minute > 0)) && (hour < 16)) {
        return 'Late';
    }
    return 'Absent';
}

// Fetch attendance records
app.get('/attendance-records', (req, res) => {
    const sql = `SELECT * FROM attendance_records`; // Fixed with backticks
    attendanceDb.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});


// Add this endpoint to track active users


app.post('/api/user-status', (req, res) => {
    const { email, isActive } = req.body;
    
    // First check if user exists
    const checkUserSql = `SELECT * FROM users WHERE email = ?`;
    
    loginDb.get(checkUserSql, [email], (err, user) => {
        if (user) {
            // Update existing user's status
            const updateSql = `UPDATE users SET is_active = ? WHERE email = ?`;
            loginDb.run(updateSql, [isActive ? 1 : 0, email], function(err) {
                if (err) {
                    console.log('Status update:', err);
                    return res.json({ success: false });
                }
                res.json({ 
                    success: true, 
                    email: email,
                    isActive: isActive 
                });
            });
        } else {
            res.json({ 
                success: false, 
                message: 'User not found'
            });
        }
    });
});

app.get('/attendance-records/:email', (req, res) => {
    const userEmail = req.params.email;
    const sql = `
        SELECT * FROM attendance_records 
        WHERE employee_email = ? 
        ORDER BY date DESC, time_in DESC
    `;
    
    attendanceDb.all(sql, [userEmail], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows || []);
    });
});



// Log time out
app.post('/log-time-out', (req, res) => {
    const { email, timeOut } = req.body;
    const currentDate = new Date().toLocaleDateString('en-US');
    
    const sql = `
        UPDATE attendance_records 
        SET time_out = ?, is_active = 0 
        WHERE employee_email = ? 
        AND date = ? 
        AND time_out IS NULL
    `;
    
    attendanceDb.run(sql, [timeOut, email, currentDate], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Error updating time-out' });
        }
        res.json({ message: 'Time-out recorded successfully' });
    });
});

const loginDb = new sqlite3.Database(attendanceDbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create `users` table if it doesn't exist
loginDb.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'employee'))
    );
`);


app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    const query = `SELECT * FROM users WHERE email = ?`;

    loginDb.get(query, [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Verify password with bcrypt
        try {
            const passwordMatch = await bcrypt.compare(password, user.password);
            
            if (!passwordMatch) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            // Update active status
            await loginDb.run('UPDATE users SET is_active = 1 WHERE email = ?', [email]);

            // For employees, create attendance record
            if (user.role === 'employee') {
                const timeIn = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Manila' });
                const date = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
                
                await loginDb.run(`
                    INSERT INTO attendance_records (employee_email, date, time_in, is_active)
                    VALUES (?, ?, ?, 1)
                `, [email, date, timeIn]);
            }

            res.json({
                success: true,
                role: user.role,
                email: user.email
            });
        } catch (error) {
            console.error('Password verification error:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });
});
// Enhanced active users endpoint
app.get('/active-users', (req, res) => {
    const query = `
        SELECT u.email, u.role, ar.time_in, ar.status
        FROM users u
        LEFT JOIN attendance_records ar 
            ON u.email = ar.employee_email 
            AND DATE(ar.date) = DATE('now')
        WHERE u.is_active = 1
    `;
    
    loginDb.all(query, [], (err, users) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ activeUsers: users });
    });
});
// Endpoint to process transaction
// Updated transaction processing endpoint
app.post('/processTransaction', (req, res) => {
    const transactions = req.body;
    const currentDate = new Date().toISOString().split('T')[0];
    
    productsDb.serialize(() => {
        productsDb.run("BEGIN TRANSACTION");
        
        try {
            transactions.forEach(transaction => {
                // Try to update existing record for the same product and date
                productsDb.run(`
                    INSERT INTO products (
                        product_name, 
                        category, 
                        total_item, 
                        total_amount, 
                        date, 
                        transaction_id
                    ) 
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON CONFLICT(product_name, date) 
                    DO UPDATE SET 
                        total_item = total_item + ?,
                        total_amount = total_amount + ?
                `, [
                    transaction.name,
                    transaction.category,
                    transaction.totalItem,
                    transaction.totalAmount,
                    currentDate,
                    Date.now().toString(),
                    transaction.totalItem,
                    transaction.totalAmount
                ]);
            });

            productsDb.run("COMMIT", [], () => {
                res.json({ success: true });
            });
        } catch (error) {
            productsDb.run("ROLLBACK");
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    });
});
// Endpoint to get products data
app.get('/api/products', (req, res) => {
    const query = `
        SELECT 
            product_name,
            category,
            total_item,
            total_amount,
            date
        FROM products 
        ORDER BY date DESC, product_name
    `;

    productsDb.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ products: rows });
    });
});

// Endpoint to get inventory (stocks)
// Endpoint to get mapped inventory data
app.get('/api/stocks', (req, res) => {
    const query = `
        SELECT 
            ingredient,
            category,
            stock,
            remaining,
            date
        FROM inventory
        ORDER BY ingredient
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ stocks: rows });
    });
});

// Endpoint to update ingredients mapping when inventory is updated
app.post('/api/update-ingredients-mapping', (req, res) => {
    const { ingredient, category, stock, remaining, date } = req.body;
    
    db.run(`
        INSERT INTO ingredients_mapping (
            inventory_id,
            ingredient,
            category,
            stock,
            remaining,
            date
        )
        SELECT 
            id,
            ingredient,
            category,
            stock,
            remaining,
            date
        FROM inventory
        WHERE ingredient = ? AND date = ?
        ON CONFLICT(inventory_id, date) 
        DO UPDATE SET
            stock = excluded.stock,
            remaining = excluded.remaining
    `, [ingredient, date], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true });
    });
});

//for my admin inventory
    // Connect to the SQLite database
    const db = new sqlite3.Database(productsDbPath, (err) => {
        if (err) {
            console.error('Error connecting to the database:', err);
        } else {
            console.log('Connected to the SQLite database.');
        }
    });
    
    // Create Inventory Table
    db.run(`
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            time TEXT,
            ingredient TEXT,
            category TEXT,
            stock INTEGER,
            remaining INTEGER
        )
    `);
// API Endpoints

// Fetch all inventory items
// Fetch all inventory items
app.get('/api/inventory', (req, res) => {
    db.all('SELECT * FROM inventory', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});


app.post('/api/inventory', (req, res) => {
    const { date, time, ingredient, category, stock, remaining } = req.body;

    const query = `
        INSERT INTO inventory (date, time, ingredient, category, stock, remaining)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(date, ingredient, category) 
        DO UPDATE SET 
            time = excluded.time,
            stock = excluded.stock,
            remaining = excluded.remaining
    `;

    db.run(query, [date, time, ingredient, category, stock, remaining], function(err) {
        if (err) {
            console.error('Error inserting/updating inventory:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ 
            success: true, 
            message: 'Inventory updated successfully',
            id: this.lastID 
        });
    });
});


app.put('/api/inventory', (req, res) => {
    const { ingredient, category, stock, remaining } = req.body;
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    // First check if an entry exists for today's date
    const checkQuery = `
        SELECT * FROM inventory 
        WHERE date = ? AND ingredient = ? AND category = ?
    `;

    db.get(checkQuery, [currentDate, ingredient, category], (err, row) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database query failed',
                error: err.message
            });
        }

        if (row) {
            // Update existing record for today
            const updateQuery = `
                UPDATE inventory 
                SET stock = ?,
                    remaining = ?,
                    time = ?
                WHERE date = ? AND ingredient = ? AND category = ?
            `;

            db.run(updateQuery, [stock, remaining, currentTime, currentDate, ingredient, category], function(err) {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to update inventory',
                        error: err.message
                    });
                }

                res.json({
                    success: true,
                    message: 'Inventory updated successfully',
                    updatedItem: {
                        ingredient,
                        category,
                        stock,
                        remaining,
                        date: currentDate,
                        time: currentTime
                    }
                });
            });
        } else {
            // Insert new record for today
            const insertQuery = `
                INSERT INTO inventory (ingredient, category, stock, remaining, date, time)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.run(insertQuery, [ingredient, category, stock, remaining, currentDate, currentTime], function(err) {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to create new inventory item',
                        error: err.message
                    });
                }

                res.json({
                    success: true,
                    message: 'New inventory item created successfully',
                    newItem: {
                        ingredient,
                        category,
                        stock,
                        remaining,
                        date: currentDate,
                        time: currentTime
                    }
                });
            });
        }
    });
});



app.post('/process-transaction', (req, res) => {
    const transactions = req.body;
    const currentDate = new Date().toISOString().split('T')[0];

    // Use serialize to ensure sequential processing
    productsDb.serialize(() => {
        productsDb.run("BEGIN TRANSACTION");
        
        const updateInventoryStmt = db.prepare(`
            UPDATE inventory 
            SET remaining = remaining - ?
            WHERE ingredient = ?
        `);

        try {
            transactions.forEach(transaction => {
                // Rest of your transaction processing code
            });
            
            updateInventoryStmt.finalize();
            productsDb.run("COMMIT", [], (err) => {
                if (err) throw err;
                res.json({ success: true, message: 'Transaction processed successfully' });
            });
        } catch (error) {
            productsDb.run("ROLLBACK");
            updateInventoryStmt.finalize();
            res.status(500).json({ success: false, message: error.message });
        }
    });
});


function updateSummary() {
    const summaryBody = document.getElementById('summary-body');
    summaryBody.innerHTML = '';

    summary.forEach((item, index) => {
        const totalItemCost = item.price * item.qty; // Calculate total cost for this item
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td class="qty-cell">
                <input type="number" min="0" value="${item.qty}" data-index="${index}" class="qty-input" />
            </td>
            <td>₱ ${item.price.toFixed(2)}</td>
            <td>₱ ${totalItemCost.toFixed(2)}</td>
            <td style="padding-left: 10px;">
                <span class="void-button" data-index="${index}" style="cursor: pointer; font-weight: bold; color: red;">X</span>
            </td>
        `;
        summaryBody.appendChild(row);
    });

    // Attach event listeners
    attachQtyChangeListeners();
    attachVoidButtonListeners();

    // Update totals
    totalItems = summary.reduce((total, item) => total + item.qty, 0);
    totalAmount = summary.reduce((total, item) => total + (item.price * item.qty), 0);
    
    document.getElementById('total-items').innerText = totalItems;
    document.getElementById('total-amount').innerText = totalAmount.toFixed(2);
}




// Add this endpoint for inventory updates
app.put('/api/inventory/update', async (req, res) => {
    const { ingredient, used, date } = req.body;
    
    try {
        // Update only the current date's inventory
        await db.run(`
            UPDATE inventory 
            SET remaining = remaining - ? 
            WHERE ingredient = ? AND date = ?`,
            [used, ingredient, date]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/inventory/batch-update', (req, res) => {
    const updates = req.body;
    const currentDate = new Date().toLocaleDateString();
    
    const stmt = db.prepare(`
        UPDATE inventory 
        SET stock = ?, remaining = ?
        WHERE ingredient = ? AND category = ? AND date = ?
    `);

    try {
        updates.forEach(update => {
            stmt.run([
                update.stock,
                update.remaining,
                update.ingredient,
                update.category,
                currentDate
            ]);
        });
        stmt.finalize();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Delete an inventory item
app.delete('/api/inventory', (req, res) => {
    const { ingredient, category } = req.body;

    const query = `
        DELETE FROM inventory
        WHERE ingredient = ? AND category = ?
    `;

    db.run(query, [ingredient, category], function (err) {
        if (err) {
            console.error('Error deleting data:', err);
            res.status(500).json({ error: 'Failed to delete data' });
        } else {
            res.json({ message: 'Item deleted successfully' });
        }
    });
});

//for my otp
const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "arcadiojrflocarencia@gmail.com",
      pass: "mcbg pwfd wxot ftoi",
    },
  });

let otp;

// Send OTP route
app.post('/send-otp', (req, res) => {
    const { email } = req.body;
    console.log('Email received:', email);

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    otp = Math.floor(100000 + Math.random() * 900000);
    console.log('Generated OTP:', otp);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,  // Send OTP to the user's email
        subject: 'Password Reset OTP',
        text: `Hello, \n\nYour OTP for resetting your password is: ${otp}. \n\nPlease use this OTP to proceed with your password reset. \n\nIf you did not request a password reset, please ignore this email.\n\nThank you.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending OTP email:', error);
            return res.status(500).json({
                message: 'Failed to send OTP',
                error: error.message,
            });
        }
        console.log('OTP sent:', info.response);
        res.json({ message: 'OTP sent successfully' });
    });
});

// Verify OTP route
app.post('/verify-otp', (req, res) => {
    const { inputOtp } = req.body;
    if (parseInt(inputOtp) === otp) {
        res.json({ message: 'OTP verified' });
    } else {
        res.status(400).json({ message: 'Invalid OTP' });
    }
});
app.post('/reset-password', (req, res) => {
    const { email, newPassword } = req.body;
    console.log('Received data for password reset:', email, newPassword);

    if (!email || !newPassword) {
        return res.status(400).json({ message: 'Email and new password are required' });
    }

    const db = new sqlite3.Database(attendanceDbPath, (err) => {
        if (err) {
            console.error('Database connection error:', err);
            return res.status(500).json({ message: 'Failed to connect to database' });
        }
    });

    // Update the password in the database directly without hashing
    db.run('UPDATE users SET password = ? WHERE email = ?', [newPassword, email], function (err) {
        if (err) {
            console.error('Error updating password:', err);
            return res.status(500).json({ message: 'Failed to reset password' });
        }
        console.log('Rows affected:', this.changes);
        if (this.changes > 0) {
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(400).json({ message: 'Email not found' });
        }
    });
});

//this is for my sales
// this is for your sales tracking
const salesDb = new sqlite3.Database(productsDbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }

});

// Create the months table with predefined months of the year
const createMonthsTable = `
    CREATE TABLE IF NOT EXISTS months (
        month_index INTEGER PRIMARY KEY,
        month_name TEXT NOT NULL
    );
`;

// Predefined list of months (January to December)
const months = [
    { month_index: 1, month_name: 'January' },
    { month_index: 2, month_name: 'February' },
    { month_index: 3, month_name: 'March' },
    { month_index: 4, month_name: 'April' },
    { month_index: 5, month_name: 'May' },
    { month_index: 6, month_name: 'June' },
    { month_index: 7, month_name: 'July' },
    { month_index: 8, month_name: 'August' },
    { month_index: 9, month_name: 'September' },
    { month_index: 10, month_name: 'October' },
    { month_index: 11, month_name: 'November' },
    { month_index: 12, month_name: 'December' }
];

// Insert the months into the months table
const insertMonths = `
    INSERT OR REPLACE INTO months (month_index, month_name) 
    VALUES (?, ?)
`;

// Create the sales table
const createSalesTable = `
    CREATE TABLE IF NOT EXISTS sales (
        month TEXT PRIMARY KEY,
        total_sales REAL,
        rate REAL
    );
`;


// Insert or update the sales data
const updateSalesTable = () => {
    salesDb.run(createMonthsTable, (err) => {
        if (err) {
            console.error('Error creating months table:', err.message);
            return;
        }

        // Insert months into months table if they don't exist
        months.forEach((month) => {
            salesDb.run(insertMonths, [month.month_index, month.month_name], (err) => {
                if (err) {
                    console.error(`Error inserting month: ${month.month_name}`, err.message);
                }
            });
        });

        // Create sales table if not exists
        salesDb.run(createSalesTable, (err) => {
            if (err) {
                console.error('Error creating sales table:', err.message);
                return;
            }

            // Compute total sales per month and insert/update sales data
            const salesQuery = `
                INSERT INTO sales (month, total_sales, rate)
                SELECT 
                    strftime('%m', date) AS month,
                    SUM(total_amount) AS total_sales,
                    0 AS rate
                FROM products
                GROUP BY month
                ON CONFLICT(month) DO UPDATE SET
                    total_sales = excluded.total_sales;
            `;

            salesDb.run(salesQuery, [], (err) => {
                if (err) {
                    console.error('Error updating sales table:', err.message);
                    return;
                }
                console.log('Sales data updated successfully.');

                // Update the rates after the total sales are updated
                const updateRateQuery = `
                    UPDATE sales
                    SET rate = (total_sales * 100.0) / 
                        (SELECT SUM(total_sales) FROM sales);
                `;

                salesDb.run(updateRateQuery, [], (err) => {
                    if (err) {
                        console.error('Error updating rates:', err.message);
                    } else {
                        console.log('Rates updated successfully.');
                    }
                });
            });
        });
    });
};



// Endpoint to trigger sales update and fetch updated data
app.get('/update-sales', (req, res) => {
    updateSalesTable();
    res.send('Sales data updated.');
});

// Endpoint to fetch sales data with months in order
app.get('/fetch-sales-data', (req, res) => {
    const fetchQuery = `
        SELECT s.month, s.total_sales, s.rate
        FROM sales s
        JOIN months m ON strftime('%m', s.month) = m.month_index
        ORDER BY m.month_index;
    `;

    salesDb.all(fetchQuery, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});



// this is  for my uploading picture
app.post('/upload-image', (req, res) => {
    const { productName, base64Image } = req.body;

    if (!productName || !base64Image) {
        return res.status(400).json({ message: 'Product name and image are required' });
    }

    // Decode Base64 and save as an image
    const buffer = Buffer.from(base64Image, 'base64');
    const imagePath = path.join(__dirname, 'uploads', `${productName}.png`);

    fs.writeFile(imagePath, buffer, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error saving image' });
        }

        res.json({ message: 'Product added successfully!', imagePath });
    });
});

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}


app.post('/api/update-ingredients', async (req, res) => {
    const { ingredient_name, used_amount, date } = req.body;
    
    try {
        const ingredient = await db.get(`
            SELECT * FROM ingredients 
            WHERE ingredient_name = ? AND date = ?
        `, [ingredient_name, date]);

        if (ingredient) {
            await db.run(`
                UPDATE ingredients 
                SET remaining_stocks = remaining_stocks - ?
                WHERE ingredient_name = ? AND date = ?
            `, [used_amount, ingredient_name, date]);
        } else {
            const initialStocks = 100;
            await db.run(`
                INSERT INTO ingredients (ingredient_name, stocks, remaining_stocks, date)
                VALUES (?, ?, ?, ?)
            `, [ingredient_name, initialStocks, initialStocks - used_amount, date]);
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all users with their attendance status
app.get('/api/users', (req, res) => {
    const query = `
        SELECT u.*, 
               CASE WHEN a.time_out IS NULL AND a.time_in IS NOT NULL 
                    THEN 1 ELSE 0 END as is_active
        FROM users u
        LEFT JOIN attendance a ON u.email = a.email
        WHERE u.role = 'employee'
        GROUP BY u.id
    `;
    
    adduserDb.all(query, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        // Ensure we always return an array
        res.json(rows || []);
    });
});

// Add new user to both databases
app.post('/api/users', (req, res) => {
    const { email, lastName, firstName, middleName, birthDate, password } = req.body;
    
    // Always set role as 'employee'
    const role = 'employee';
    
    // First check if email already exists
    adduserDb.get('SELECT email FROM users WHERE email = ?', [email], (err, user) => {
        if (user) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        
        // Insert into main users table
        const mainQuery = `
            INSERT INTO users (
                email, password, role, last_name, first_name, 
                middle_name, birth_date, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
        `;
        
        adduserDb.run(mainQuery, 
            [email, password, role, lastName, firstName, middleName, birthDate], 
            function(err) {
                if (err) {
                    console.log('Main DB Error:', err);
                    return res.status(500).json({ error: err.message });
                }
                
                // Insert into attendance users table
                const attendanceQuery = `
                    INSERT INTO users (email, name, password, role)
                    VALUES (?, ?, ?, ?)
                `;
                
                const fullName = `${lastName}, ${firstName} ${middleName}`;
                
                adduserDb.run(attendanceQuery, 
                    [email, fullName, password, role], 
                    function(err) {
                        if (err) {
                            console.log('Attendance DB Error:', err);
                            return res.status(500).json({ error: err.message });
                        }
                        res.json({ 
                            success: true,
                            id: this.lastID,
                            message: 'User added successfully'
                        });
                    }
                );
            }
        );
    });
});

// Update user status based on attendance
app.put('/api/users/:id/status', (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    
    adduserDb.get('SELECT email FROM users WHERE id = ?', [id], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (is_active) {
            // Log time in
            adduserDb.run('INSERT INTO attendance (email, time_in) VALUES (?, datetime("now", "localtime"))', 
                [user.email], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true });
            });
        } else {
            // Log time out
            adduserDb.run('UPDATE attendance SET time_out = datetime("now", "localtime") WHERE email = ? AND time_out IS NULL', 
                [user.email], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true });
            });
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Database connection verification
adduserDb.on('open', () => {
    console.log('Connected to main database');
});

adduserDb.on('open', () => {
    console.log('Connected to attendance database');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

