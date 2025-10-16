/**
 * User Routes
 * Handles user-related API endpoints
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateRegistration, sanitizeBody } = require('../middleware/validation');
const { verifyAdminToken } = require('../middleware/auth');

// User registration
router.post('/register', sanitizeBody, validateRegistration, userController.register);

// Get user profile
router.get('/profile/:userId', userController.getProfile);

// Update user last active
router.post('/update-active', userController.updateLastActive);

// Admin routes
router.get('/admin/users', verifyAdminToken, userController.getAllUsers);
router.get('/admin/analytics', verifyAdminToken, userController.getAnalytics);

module.exports = router;
