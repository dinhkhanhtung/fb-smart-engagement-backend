/**
 * User Controller
 * Handles user-related operations
 */

const User = require('../models/User');
const Analytics = require('../models/Analytics');
const { validateRegistration } = require('../middleware/validation');

class UserController {
    /**
     * Register a new user
     */
    async register(req, res) {
        try {
            const { userId, deviceId, email } = req.body;

            // Check if user exists
            const userModel = new User();
            const existingUser = await userModel.findById(userId);
            if (existingUser) {
                return res.json({
                    success: true,
                    user: existingUser,
                    message: 'User already exists'
                });
            }

            // Create new user
            const result = await userModel.create({ userId, deviceId, email });

            // Log analytics
            const analyticsModel = new Analytics();
            await analyticsModel.log(userId, 'user_registered', { deviceId, email });

            res.json({
                success: true,
                message: 'User registered successfully',
                trialStart: result.trialStart
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get user profile
     */
    async getProfile(req, res) {
        try {
            const { userId } = req.params;
            const userModel = new User();
            const user = await userModel.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            res.json({
                success: true,
                user
            });

        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Update user last active
     */
    async updateLastActive(req, res) {
        try {
            const { userId } = req.body;
            const userModel = new User();
            await userModel.updateLastActive(userId);

            res.json({
                success: true,
                message: 'Last active updated'
            });

        } catch (error) {
            console.error('Update last active error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get all users (admin only)
     */
    async getAllUsers(req, res) {
        try {
            const userModel = new User();
            const users = await userModel.getAll();
            res.json({ success: true, users });

        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get user analytics (admin only)
     */
    async getAnalytics(req, res) {
        try {
            const userModel = new User();
            const analytics = await userModel.getAnalytics();
            res.json({ success: true, analytics });

        } catch (error) {
            console.error('Get analytics error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get activation status for extension
     */
    async getActivationStatus(req, res) {
        try {
            const { userId } = req.params;
            console.log('Checking activation status for user:', userId);

            const userModel = new User();
            const activationData = await userModel.getActivationFlag(userId);

            if (activationData && activationData.activated) {
                res.json({
                    success: true,
                    activated: true,
                    licenseKey: activationData.licenseKey,
                    plan: activationData.plan,
                    activatedAt: activationData.activatedAt
                });
            } else {
                res.json({
                    success: true,
                    activated: false
                });
            }

        } catch (error) {
            console.error('Get activation status error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Activate license for extension
     */
    async activateLicense(req, res) {
        try {
            const { userId, licenseKey } = req.body;
            console.log('Activating license for user:', userId);

            // Validate license
            const licenseModel = new License();
            const license = await licenseModel.getByKey(licenseKey);
            if (!license || license.userId !== userId) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid license key'
                });
            }

            // Check if license is expired
            if (new Date(license.expires) < new Date()) {
                return res.status(400).json({
                    success: false,
                    error: 'License expired'
                });
            }

            // Update user to PRO
            const userModel = new User();
            await userModel.updateProStatus(userId, true, license.plan);

            // Clear activation flag
            await userModel.setActivationFlag(userId, null);

            res.json({
                success: true,
                message: 'License activated successfully',
                plan: license.plan,
                expires: license.expires
            });

        } catch (error) {
            console.error('Activate license error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new UserController();
