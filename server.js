/**
 * FB Smart Engagement Pro - Backend API (Restructured)
 * Server cho quản lý users, payments và licenses
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import configuration and routes
const config = require('./config');
const routes = require('./routes');

const app = express();
const PORT = config.server.port;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Use routes
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 FB Smart Engagement Pro Backend running on port ${PORT}`);
        console.log(`📊 Environment: ${config.server.env}`);
        console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
        console.log(`👨‍💼 Admin Panel: http://localhost:${PORT}/admin`);
    });
}

module.exports = app;
