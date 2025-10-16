/**
 * Admin Controller
 * Handles admin-related operations
 */

const User = require('../models/User');
const Payment = require('../models/Payment');
const License = require('../models/License');
const Analytics = require('../models/Analytics');
const { generateAdminToken } = require('../middleware/auth');
const config = require('../config');

class AdminController {
    /**
     * Admin login
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            console.log('Login attempt:', {
                email,
                adminEmail: config.admin.email,
                passwordMatch: password === config.admin.password
            });

            if (email === config.admin.email && password === config.admin.password) {
                const token = generateAdminToken(email);

                console.log('Login successful for:', email);

                res.json({
                    success: true,
                    token,
                    message: 'Login successful'
                });
            } else {
                console.log('Login failed:', {
                    email,
                    expectedEmail: config.admin.email,
                    passwordMatch: password === config.admin.password
                });

                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials',
                    debug: {
                        providedEmail: email,
                        expectedEmail: config.admin.email,
                        passwordMatch: password === config.admin.password
                    }
                });
            }

        } catch (error) {
            console.error('Admin login error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get dashboard analytics
     */
    async getAnalytics(req, res) {
        try {
            const analytics = await User.getAnalytics();
            res.json({ success: true, analytics });

        } catch (error) {
            console.error('Get analytics error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get all users
     */
    async getUsers(req, res) {
        try {
            const users = await User.getAll();
            res.json({ success: true, users });

        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get all payments
     */
    async getPayments(req, res) {
        try {
            const payments = await Payment.getAll();
            res.json({ success: true, payments });

        } catch (error) {
            console.error('Get payments error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get all licenses
     */
    async getLicenses(req, res) {
        try {
            const licenses = await License.getAll();
            res.json({ success: true, licenses });

        } catch (error) {
            console.error('Get licenses error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get analytics summary
     */
    async getAnalyticsSummary(req, res) {
        try {
            const summary = await Analytics.getSummary();
            res.json({ success: true, summary });

        } catch (error) {
            console.error('Get analytics summary error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new AdminController();
