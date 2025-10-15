// FB Smart Engagement Pro - Configuration Example
// Copy this file to config.js and fill in your values

module.exports = {
    // Database
    database: {
        url: 'database.db'
    },

    // Stripe Configuration
    stripe: {
        publicKey: 'pk_test_your_stripe_public_key',
        secretKey: 'sk_test_your_stripe_secret_key',
        webhookSecret: 'whsec_your_webhook_secret'
    },

    // Email Configuration
    email: {
        service: 'gmail',
        user: 'your_email@gmail.com',
        pass: 'your_app_password'
    },

    // JWT Secret
    jwt: {
        secret: 'your_jwt_secret_key'
    },

    // Server Configuration
    server: {
        port: 3000,
        env: 'development'
    }
};
