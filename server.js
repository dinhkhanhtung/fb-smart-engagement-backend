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
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('database.db');

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
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id VARCHAR(255),
        stripe_payment_id VARCHAR(255),
        amount INTEGER,
        currency VARCHAR(10),
        plan VARCHAR(50),
        status VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
 * Stripe Payment Webhook
 */
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        handleSuccessfulPayment(paymentIntent);
    }

    res.json({ received: true });
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

// Start server
app.listen(PORT, () => {
    console.log(`FB Smart Engagement Pro Backend running on port ${PORT}`);
});

module.exports = app;
