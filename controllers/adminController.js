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

    /**
     * Approve payment
     */
    async approvePayment(req, res) {
        try {
            const { paymentId } = req.params;
            console.log('Approving payment:', paymentId);

            // Get payment details
            const payment = await Payment.getById(paymentId);
            if (!payment) {
                return res.status(404).json({ success: false, error: 'Payment not found' });
            }

            if (payment.status === 'completed') {
                return res.status(400).json({ success: false, error: 'Payment already approved' });
            }

            // Update payment status
            await Payment.updateStatus(paymentId, 'completed');

            // Create or update user account
            let user = await User.getById(payment.user_id);
            if (!user) {
                // Create new user account
                const userInfo = payment.bank_info ? JSON.parse(payment.bank_info) : {};
                user = await User.create({
                    userId: payment.user_id,
                    email: userInfo.email || 'unknown@example.com',
                    deviceId: `device_${Date.now()}`,
                    isPro: true,
                    plan: payment.plan
                });
            } else {
                // Update existing user to PRO
                await User.updateProStatus(payment.user_id, true, payment.plan);
            }

            // Create license for user
            const licenseKey = await License.create({
                userId: payment.user_id,
                plan: payment.plan,
                expires: new Date(Date.now() + (payment.plan === 'pro_monthly' ? 30 : 365) * 24 * 60 * 60 * 1000)
            });

            console.log('Payment approved successfully:', {
                paymentId,
                userId: payment.user_id,
                licenseKey
            });

            res.json({
                success: true,
                message: 'Payment approved successfully',
                licenseKey
            });

        } catch (error) {
            console.error('Approve payment error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new AdminController();
