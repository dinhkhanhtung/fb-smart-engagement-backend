/**
 * Version Routes
 * Handles version-related API endpoints
 */

const express = require('express');
const router = express.Router();
const versionController = require('../controllers/versionController');
const { verifyAdminToken } = require('../middleware/auth');

// Public routes
router.get('/info', versionController.getVersionInfo);
router.post('/check', versionController.checkUserVersion);

// Admin routes (protected)
router.get('/notifications', verifyAdminToken, versionController.getUpdateNotifications);
router.post('/notify', verifyAdminToken, versionController.sendUpdateNotification);

module.exports = router;
