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
            const existingUser = await User.findById(userId);
            if (existingUser) {
                return res.json({
                    success: true,
                    user: existingUser,
                    message: 'User already exists'
                });
            }

            // Create new user
            const result = await User.create({ userId, deviceId, email });

            // Log analytics
            await Analytics.log(userId, 'user_registered', { deviceId, email });

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
            const user = await User.findById(userId);

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
            await User.updateLastActive(userId);

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
            const users = await User.getAll();
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
            const analytics = await User.getAnalytics();
            res.json({ success: true, analytics });

        } catch (error) {
            console.error('Get analytics error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new UserController();
