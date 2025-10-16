/**
 * Main Routes Index
 * Combines all route modules
 */

const express = require('express');
const path = require('path');

// Import route modules
const userRoutes = require('./userRoutes');
const licenseRoutes = require('./licenseRoutes');
const paymentRoutes = require('./paymentRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

// API Routes
router.use('/api/users', userRoutes);
router.use('/api/licenses', licenseRoutes);
router.use('/api/payments', paymentRoutes);
router.use('/api/admin', adminRoutes);

// Static file routes
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'landing.html'));
});

router.get('/download', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'download.html'));
});

router.get('/download/chrome', (req, res) => {
    const filePath = path.join(__dirname, '../public', 'FB-Smart-Engagement-Pro-Chrome.zip');
    res.download(filePath, 'FB-Smart-Engagement-Pro-Chrome.zip', (err) => {
        if (err) {
            console.error('Error downloading Chrome extension:', err);
            res.status(404).send('Chrome extension file not found');
        }
    });
});

router.get('/download/firefox', (req, res) => {
    const filePath = path.join(__dirname, '../public', 'FB-Smart-Engagement-Pro-Firefox.zip');
    res.download(filePath, 'FB-Smart-Engagement-Pro-Firefox.zip', (err) => {
        if (err) {
            console.error('Error downloading Firefox extension:', err);
            res.status(404).send('Firefox extension file not found');
        }
    });
});

router.get('/test', (req, res) => {
    res.json({
        message: 'Server is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000
    });
});

router.get('/test-html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'test.html'));
});

router.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'payment-auto.html'));
});

// Admin page routes
router.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'admin-login.html'));
});

router.get('/admin/dashboard', (req, res) => {
    const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.redirect('/admin');
    }

    try {
        const jwt = require('jsonwebtoken');
        const config = require('../config');
        const decoded = jwt.verify(token, config.jwt.secret);
        if (decoded.role !== 'admin') {
            return res.redirect('/admin');
        }
        res.sendFile(path.join(__dirname, '../public', 'admin.html'));
    } catch (error) {
        res.redirect('/admin');
    }
});

// Health check endpoint
router.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'FB Smart Engagement Pro API is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
