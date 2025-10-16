/**
 * FB Smart Engagement Pro - Backend API
 * Server cho quản lý users, payments và licenses
 */

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup - Use in-memory database for Vercel
const db = new sqlite3.Database(':memory:');

// Initialize database
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        device_id VARCHAR(255),
        email VARCHAR(255),
        trial_start DATETIME,
        is_trial BOOLEAN DEFAULT 1,
        is_pro BOOLEAN DEFAULT 0,
        plan VARCHAR(50) DEFAULT 'trial',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_active DATETIME
    )`);

    // Licenses table
    db.run(`CREATE TABLE IF NOT EXISTS licenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id VARCHAR(255),
        license_key VARCHAR(255) UNIQUE,
        plan VARCHAR(50),
        expires_at DATETIME,
        status VARCHAR(50) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Payments table
    db.run(`CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        plan VARCHAR(50),
        amount DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'pending',
        transaction_id VARCHAR(255),
        bank_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        verified_at DATETIME
    )`);

    // Analytics table
    db.run(`CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id VARCHAR(255),
        event_type VARCHAR(100),
        event_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

app.get('/download', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'download.html'));
});

app.get('/download/chrome', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'FB-Smart-Engagement-Pro-Chrome.zip');
    res.download(filePath, 'FB-Smart-Engagement-Pro-Chrome.zip', (err) => {
        if (err) {
            console.error('Error downloading Chrome extension:', err);
            res.status(404).send('Chrome extension file not found');
        }
    });
});

app.get('/download/firefox', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'FB-Smart-Engagement-Pro-Firefox.zip');
    res.download(filePath, 'FB-Smart-Engagement-Pro-Firefox.zip', (err) => {
        if (err) {
            console.error('Error downloading Firefox extension:', err);
            res.status(404).send('Firefox extension file not found');
        }
    });
});

app.get('/test', (req, res) => {
    res.json({
        message: 'Server is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000
    });
});

app.get('/test-html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'payment-auto.html'));
});

// ==================== API ROUTES ====================

/**
 * User Registration
 */
app.post('/api/register', async (req, res) => {
    try {
        const { userId, deviceId, email } = req.body;

        // Check if user exists
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE user_id = ?', [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (existingUser) {
            return res.json({
                success: true,
                user: existingUser,
                message: 'User already exists'
            });
        }

        // Create new user
        const trialStart = new Date().toISOString();
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (user_id, device_id, email, trial_start, is_trial) VALUES (?, ?, ?, ?, ?)',
                [userId, deviceId, email, trialStart, true],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        // Log analytics
        await logAnalytics(userId, 'user_registered', { deviceId, email });

        res.json({
            success: true,
            message: 'User registered successfully',
            trialStart: trialStart
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * License Validation
 */
app.post('/api/validate', async (req, res) => {
    try {
        const { licenseKey, userId, deviceId } = req.body;

        const license = await new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM licenses WHERE license_key = ? AND user_id = ? AND status = "active"',
                [licenseKey, userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!license) {
            return res.json({
                valid: false,
                message: 'License not found or invalid'
            });
        }

        // Check expiration
        const now = new Date();
        const expires = new Date(license.expires_at);

        if (now > expires) {
            // Update license status
            await new Promise((resolve, reject) => {
                db.run(
                    'UPDATE licenses SET status = "expired" WHERE license_key = ?',
                    [licenseKey],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });

            return res.json({
                valid: false,
                message: 'License expired'
            });
        }

        // Update user status
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET is_pro = 1, is_trial = 0, plan = ? WHERE user_id = ?',
                [license.plan, userId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.json({
            valid: true,
            expires: expires.getTime(),
            plan: license.plan
        });

    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Create License
 */
app.post('/api/create-license', async (req, res) => {
    try {
        const { userId, plan, expires } = req.body;

        const licenseKey = generateLicenseKey();
        const expiresAt = new Date(expires).toISOString();

        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO licenses (user_id, license_key, plan, expires_at) VALUES (?, ?, ?, ?)',
                [userId, licenseKey, plan, expiresAt],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        // Update user to PRO
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET is_pro = 1, is_trial = 0, plan = ? WHERE user_id = ?',
                [plan, userId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        // Send license email
        await sendLicenseEmail(userId, licenseKey, plan);

        res.json({
            success: true,
            licenseKey: licenseKey,
            expires: expiresAt
        });

    } catch (error) {
        console.error('Create license error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Bank Transfer Payment (Vietnam) - Auto System
 */
app.post('/api/payment/bank-transfer', async (req, res) => {
    try {
        const { userId, plan, amount, paymentCode, userInfo } = req.body;

        // Validate required fields
        if (!userId || !plan || !amount || !paymentCode || !userInfo) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Create pending payment record
        db.run(`
            INSERT INTO payments (id, user_id, plan, amount, status, transaction_id, bank_info, created_at)
            VALUES (?, ?, ?, ?, 'pending', ?, ?, datetime('now'))
        `, [paymentCode, userId, plan, amount, paymentCode, JSON.stringify(userInfo)]);

        res.json({
            success: true,
            paymentId: paymentCode,
            message: 'Payment code created. Please transfer money and wait for auto verification.',
            bankInfo: {
                accountNumber: process.env.BANK_ACCOUNT || '0982581222',
                accountName: process.env.BANK_NAME || 'Đinh Khánh Tùng',
                bank: process.env.BANK_NAME || 'BIDV',
                branch: process.env.BANK_BRANCH || 'BIDV',
                amount: amount,
                content: `FBENGAGE ${paymentCode}`
            }
        });

    } catch (error) {
        console.error('Bank transfer payment error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Check Payment Status
 */
app.get('/api/payment/check/:paymentCode', (req, res) => {
    const { paymentCode } = req.params;

    db.get('SELECT * FROM payments WHERE id = ?', [paymentCode], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.json({
            status: row.status,
            paymentId: row.id,
            amount: row.amount,
            plan: row.plan,
            createdAt: row.created_at
        });
    });
});

/**
 * Manual Payment Verification (Admin)
 */
app.post('/api/admin/verify-payment', async (req, res) => {
    try {
        const { paymentId, status } = req.body;

        if (!paymentId || !status) {
            return res.status(400).json({
                success: false,
                error: 'Missing paymentId or status'
            });
        }

        // Update payment status
        db.run(`
            UPDATE payments 
            SET status = ?, verified_at = datetime('now')
            WHERE id = ?
        `, [status, paymentId]);

        // If approved, activate PRO license
        if (status === 'approved') {
            const payment = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM payments WHERE id = ?', [paymentId], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (payment) {
                await activateProLicense(payment.user_id, payment.plan, null);
            }
        }

        res.json({ success: true, message: 'Payment status updated' });

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Admin Dashboard - Get Users
 */
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await new Promise((resolve, reject) => {
            db.all(`
                SELECT u.*, l.license_key, l.expires_at, l.status as license_status
                FROM users u
                LEFT JOIN licenses l ON u.user_id = l.user_id
                ORDER BY u.created_at DESC
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({ success: true, users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Admin Dashboard - Get Analytics
 */
app.get('/api/admin/analytics', async (req, res) => {
    try {
        const analytics = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    COUNT(*) as total_users,
                    SUM(CASE WHEN is_pro = 1 THEN 1 ELSE 0 END) as pro_users,
                    SUM(CASE WHEN is_trial = 1 THEN 1 ELSE 0 END) as trial_users,
                    SUM(CASE WHEN plan = 'pro_monthly' THEN 1 ELSE 0 END) as monthly_users,
                    SUM(CASE WHEN plan = 'pro_yearly' THEN 1 ELSE 0 END) as yearly_users
                FROM users
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row[0]);
            });
        });

        res.json({ success: true, analytics });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate unique license key
 */
function generateLicenseKey() {
    const prefix = 'LIC';
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(8).toString('hex');
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

/**
 * Handle successful payment
 */
async function handleSuccessfulPayment(paymentIntent) {
    try {
        const { amount, currency, metadata } = paymentIntent;
        const userId = metadata.userId;
        const plan = metadata.plan;

        // Calculate expiration date
        const now = new Date();
        let expires;
        if (plan === 'pro_monthly') {
            expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        } else if (plan === 'pro_yearly') {
            expires = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 days
        }

        // Create license
        const licenseKey = generateLicenseKey();
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO licenses (user_id, license_key, plan, expires_at) VALUES (?, ?, ?, ?)',
                [userId, licenseKey, plan, expires.toISOString()],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        // Record payment
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO payments (user_id, stripe_payment_id, amount, currency, plan, status) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, paymentIntent.id, amount, currency, plan, 'completed'],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        // Update user to PRO
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET is_pro = 1, is_trial = 0, plan = ? WHERE user_id = ?',
                [plan, userId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        // Send license email
        await sendLicenseEmail(userId, licenseKey, plan);

        console.log(`Payment processed for user ${userId}, license: ${licenseKey}`);

    } catch (error) {
        console.error('Payment processing error:', error);
    }
}

/**
 * Send license email
 */
async function sendLicenseEmail(userId, licenseKey, plan) {
    try {
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userId, // In real app, get email from user record
            subject: 'FB Smart Engagement Pro - License Activated',
            html: `
                <h2>🎉 PRO License Activated!</h2>
                <p>Your license key: <strong>${licenseKey}</strong></p>
                <p>Plan: ${plan}</p>
                <p>Thank you for upgrading to PRO!</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('License email sent to:', userId);

    } catch (error) {
        console.error('Email sending error:', error);
    }
}

/**
 * Activate PRO license for user
 */
async function activateProLicense(userId, plan, expires) {
    try {
        const licenseKey = generateLicenseKey();
        const expiresAt = expires ? new Date(expires).toISOString() : null;

        // Create license
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO licenses (user_id, license_key, plan, expires_at) VALUES (?, ?, ?, ?)',
                [userId, licenseKey, plan, expiresAt],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        // Update user to PRO
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET is_pro = 1, is_trial = 0, plan = ? WHERE user_id = ?',
                [plan, userId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        console.log(`PRO license activated for user ${userId}, license: ${licenseKey}`);
        return licenseKey;

    } catch (error) {
        console.error('License activation error:', error);
        throw error;
    }
}

/**
 * Log analytics
 */
async function logAnalytics(userId, eventType, eventData) {
    try {
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO analytics (user_id, event_type, event_data) VALUES (?, ?, ?)',
                [userId, eventType, JSON.stringify(eventData)],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    } catch (error) {
        console.error('Analytics logging error:', error);
    }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'FB Smart Engagement Pro API is running' });
});

// Admin login route
app.get('/admin', (req, res) => {
    res.sendFile(require('path').join(__dirname, 'public', 'admin-login.html'));
});

// Admin dashboard route (protected)
app.get('/admin/dashboard', (req, res) => {
    const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.redirect('/admin');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin-secret-key');
        if (decoded.role !== 'admin') {
            return res.redirect('/admin');
        }
        res.sendFile(require('path').join(__dirname, 'public', 'admin.html'));
    } catch (error) {
        res.redirect('/admin');
    }
});

// Admin login API
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL || 'dinhkhanhtung@outlook.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

    console.log('Login attempt:', { email, adminEmail, passwordMatch: password === adminPassword });

    if (email === adminEmail && password === adminPassword) {
        const token = jwt.sign(
            { email, role: 'admin' },
            process.env.JWT_SECRET || 'admin-secret-key',
            { expiresIn: '24h' }
        );

        console.log('Login successful for:', email);

        res.json({
            success: true,
            token,
            message: 'Login successful'
        });
    } else {
        console.log('Login failed:', { email, expectedEmail: adminEmail, passwordMatch: password === adminPassword });

        res.status(401).json({
            success: false,
            message: 'Invalid credentials',
            debug: {
                providedEmail: email,
                expectedEmail: adminEmail,
                passwordMatch: password === adminPassword
            }
        });
    }
});

// Middleware to verify admin token
function verifyAdminToken(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin-secret-key');
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
}

// Admin API endpoints
app.get('/api/admin/analytics', verifyAdminToken, async (req, res) => {
    try {
        const analytics = await new Promise((resolve, reject) => {
            db.all(`
                SELECT
                    COUNT(*) as total_users,
                    SUM(CASE WHEN is_pro = 1 THEN 1 ELSE 0 END) as pro_users,
                    SUM(CASE WHEN is_trial = 1 THEN 1 ELSE 0 END) as trial_users,
                    SUM(CASE WHEN plan = 'pro_monthly' THEN 1 ELSE 0 END) as monthly_users,
                    SUM(CASE WHEN plan = 'pro_yearly' THEN 1 ELSE 0 END) as yearly_users
                FROM users
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row[0]);
            });
        });

        res.json({
            success: true,
            analytics: analytics
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/admin/users', verifyAdminToken, (req, res) => {
    db.all("SELECT * FROM users ORDER BY created_at DESC", (err, users) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, users });
    });
});

app.get('/api/admin/payments', verifyAdminToken, (req, res) => {
    db.all("SELECT * FROM payments ORDER BY created_at DESC", (err, payments) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, payments });
    });
});

app.get('/api/admin/licenses', verifyAdminToken, (req, res) => {
    db.all("SELECT * FROM licenses ORDER BY created_at DESC", (err, licenses) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, licenses });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`FB Smart Engagement Pro Backend running on port ${PORT}`);
    });
}

module.exports = app;
