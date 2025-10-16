/**
 * Validation Middleware
 * Handles request validation and sanitization
 */

/**
 * Validate user registration data
 */
const validateRegistration = (req, res, next) => {
    const { userId, deviceId, email } = req.body;

    if (!userId) {
        return res.status(400).json({
            success: false,
            error: 'User ID is required'
        });
    }

    if (!deviceId) {
        return res.status(400).json({
            success: false,
            error: 'Device ID is required'
        });
    }

    // Basic email validation
    if (email && !isValidEmail(email)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid email format'
        });
    }

    next();
};

/**
 * Validate license validation data
 */
const validateLicenseValidation = (req, res, next) => {
    const { licenseKey, userId, deviceId } = req.body;

    if (!licenseKey) {
        return res.status(400).json({
            success: false,
            error: 'License key is required'
        });
    }

    if (!userId) {
        return res.status(400).json({
            success: false,
            error: 'User ID is required'
        });
    }

    next();
};

/**
 * Validate payment data
 */
const validatePayment = (req, res, next) => {
    const { plan, amount, paymentCode, customerName, customerEmail, customerPhone } = req.body;

    if (!plan || !amount || !paymentCode || !customerName || !customerEmail || !customerPhone) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields'
        });
    }

    // Validate plan
    const validPlans = ['pro_monthly', 'pro_yearly'];
    if (!validPlans.includes(plan)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid plan'
        });
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
            success: false,
            error: 'Invalid amount'
        });
    }

    next();
};

/**
 * Validate admin login data
 */
const validateAdminLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Email and password are required'
        });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid email format'
        });
    }

    next();
};

/**
 * Validate payment verification data
 */
const validatePaymentVerification = (req, res, next) => {
    const { paymentId, status } = req.body;

    if (!paymentId || !status) {
        return res.status(400).json({
            success: false,
            error: 'Payment ID and status are required'
        });
    }

    const validStatuses = ['approved', 'rejected', 'pending'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid status'
        });
    }

    next();
};

/**
 * Basic email validation
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Sanitize string input
 */
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>]/g, '');
};

/**
 * Sanitize request body
 */
const sanitizeBody = (req, res, next) => {
    if (req.body) {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitizeString(req.body[key]);
            }
        }
    }
    next();
};

module.exports = {
    validateRegistration,
    validateLicenseValidation,
    validatePayment,
    validateAdminLogin,
    validatePaymentVerification,
    sanitizeBody
};
