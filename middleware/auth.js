/**
 * Authentication Middleware
 * Handles JWT token verification and admin authentication
 */

const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Verify admin token
 */
const verifyAdminToken = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
};

/**
 * Generate admin token
 */
const generateAdminToken = (email) => {
    return jwt.sign(
        { email, role: 'admin' },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );
};

/**
 * Verify user token (if needed in future)
 */
const verifyUserToken = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
};

module.exports = {
    verifyAdminToken,
    verifyUserToken,
    generateAdminToken
};
