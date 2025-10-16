/**
 * License Routes
 * Handles license-related API endpoints
 */

const express = require('express');
const router = express.Router();
const licenseController = require('../controllers/licenseController');
const { validateLicenseValidation, sanitizeBody } = require('../middleware/validation');
const { verifyAdminToken } = require('../middleware/auth');

// License validation
router.post('/validate', sanitizeBody, validateLicenseValidation, licenseController.validate);

// Admin routes
router.post('/admin/create', verifyAdminToken, licenseController.create);
router.get('/admin/licenses', verifyAdminToken, licenseController.getAll);
router.put('/admin/update-status', verifyAdminToken, licenseController.updateStatus);

module.exports = router;
