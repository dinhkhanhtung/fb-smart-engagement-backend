/**
 * Helper Utilities
 * Common utility functions used throughout the application
 */

const crypto = require('crypto');

/**
 * Generate unique payment code
 */
function generatePaymentCode() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `PAY-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generate unique transaction ID
 */
function generateTransactionId() {
    return crypto.randomUUID();
}

/**
 * Calculate expiration date based on plan
 */
function calculateExpirationDate(plan) {
    const now = new Date();

    switch (plan) {
        case 'pro_monthly':
            return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        case 'pro_yearly':
            return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 days
        default:
            return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Default 30 days
    }
}

/**
 * Format currency
 */
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Format date
 */
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Generate random string
 */
function generateRandomString(length = 8) {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash password (for future use)
 */
function hashPassword(password) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Verify password (for future use)
 */
function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}

/**
 * Validate license key format
 */
function isValidLicenseKey(licenseKey) {
    const licenseRegex = /^LIC-[A-Z0-9]+-[A-Z0-9]+$/;
    return licenseRegex.test(licenseKey);
}

/**
 * Validate payment code format
 */
function isValidPaymentCode(paymentCode) {
    const paymentRegex = /^PAY-[A-Z0-9]+-[A-Z0-9]+$/;
    return paymentRegex.test(paymentCode);
}

/**
 * Get plan display name
 */
function getPlanDisplayName(plan) {
    const planNames = {
        'trial': 'Trial',
        'pro_monthly': 'PRO Monthly',
        'pro_yearly': 'PRO Yearly'
    };
    return planNames[plan] || plan;
}

/**
 * Get plan price
 */
function getPlanPrice(plan) {
    const prices = {
        'pro_monthly': 9.99,
        'pro_yearly': 99.99
    };
    return prices[plan] || 0;
}

/**
 * Check if user is in trial period
 */
function isTrialExpired(trialStart) {
    const now = new Date();
    const trialDate = new Date(trialStart);
    const trialDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    return (now.getTime() - trialDate.getTime()) > trialDuration;
}

/**
 * Get days until trial expires
 */
function getDaysUntilTrialExpires(trialStart) {
    const now = new Date();
    const trialDate = new Date(trialStart);
    const trialDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const daysLeft = Math.ceil((trialDuration - (now.getTime() - trialDate.getTime())) / (24 * 60 * 60 * 1000));

    return Math.max(0, daysLeft);
}

module.exports = {
    generatePaymentCode,
    generateTransactionId,
    calculateExpirationDate,
    formatCurrency,
    formatDate,
    generateRandomString,
    hashPassword,
    verifyPassword,
    isValidLicenseKey,
    isValidPaymentCode,
    getPlanDisplayName,
    getPlanPrice,
    isTrialExpired,
    getDaysUntilTrialExpires
};
