/**
 * Payment Routes
 * Handles payment-related API endpoints
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { validatePayment, validatePaymentVerification, sanitizeBody } = require('../middleware/validation');
const { verifyAdminToken } = require('../middleware/auth');

// Bank transfer payment
router.post('/bank-transfer', sanitizeBody, validatePayment, paymentController.createBankTransfer);

// Check payment status
router.get('/check/:paymentCode', paymentController.checkStatus);

// Get payments by user
router.get('/user/:userId', paymentController.getByUser);

// Admin routes
router.post('/admin/verify', verifyAdminToken, validatePaymentVerification, paymentController.verifyPayment);
router.get('/admin/payments', verifyAdminToken, paymentController.getAll);

module.exports = router;
