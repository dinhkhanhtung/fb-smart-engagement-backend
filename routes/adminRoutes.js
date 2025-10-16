/**
 * Admin Routes
 * Handles admin-related API endpoints
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { validateAdminLogin, sanitizeBody } = require('../middleware/validation');
const { verifyAdminToken } = require('../middleware/auth');

// Admin login
router.post('/login', sanitizeBody, validateAdminLogin, adminController.login);

// Dashboard routes (protected)
router.get('/analytics', verifyAdminToken, adminController.getAnalytics);
router.get('/users', verifyAdminToken, adminController.getUsers);
router.get('/payments', verifyAdminToken, adminController.getPayments);
router.get('/licenses', verifyAdminToken, adminController.getLicenses);
router.get('/analytics-summary', verifyAdminToken, adminController.getAnalyticsSummary);

// Import userController for additional admin functions
const userController = require('../controllers/userController');

// Payment management routes
router.post('/payments/:paymentId/approve', verifyAdminToken, adminController.approvePayment);

// Extension activation routes
router.get('/users/activation-status/:userId', verifyAdminToken, userController.getActivationStatus);
router.post('/users/activate-license', verifyAdminToken, userController.activateLicense);

module.exports = router;
