/**
 * Application Configuration
 * Centralized configuration management
 */

require('dotenv').config();

const config = {
    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },

    // Database Configuration
    database: {
        url: process.env.DATABASE_URL || ':memory:'
    },

    // JWT Configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'admin-secret-key',
        expiresIn: '24h'
    },

    // Email Configuration
    email: {
        service: process.env.EMAIL_SERVICE || 'gmail',
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    // Admin Configuration
    admin: {
        email: process.env.ADMIN_EMAIL || 'dinhkhanhtung@outlook.com',
        password: process.env.ADMIN_PASSWORD || 'admin123456'
    },

    // Bank Configuration (Vietnam)
    bank: {
        accountNumber: process.env.BANK_ACCOUNT || '0982581222',
        accountName: process.env.BANK_NAME || 'Đinh Khánh Tùng',
        bank: process.env.BANK_NAME || 'BIDV',
        branch: process.env.BANK_BRANCH || 'BIDV'
    },

    // Stripe Configuration (if needed)
    stripe: {
        publicKey: process.env.STRIPE_PUBLIC_KEY,
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    }
};

module.exports = config;
