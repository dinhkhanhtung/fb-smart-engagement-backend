/**
 * Payment Controller
 * Handles payment-related operations
 */

const Payment = require('../models/Payment');
const License = require('../models/License');
const User = require('../models/User');
const { generatePaymentCode, calculateExpirationDate } = require('../utils/helpers');
const config = require('../config');

class PaymentController {
    /**
     * Create bank transfer payment
     */
    async createBankTransfer(req, res) {
        try {
            console.log('Payment request body:', req.body);
            const { plan, amount, paymentCode, customerName, customerEmail, customerPhone } = req.body;
            
            // Map frontend plan to backend plan
            const planMapping = {
                'monthly': 'pro_monthly',
                'yearly': 'pro_yearly', 
                'lifetime': 'pro_yearly' // Treat lifetime as yearly for now
            };
            
            const mappedPlan = planMapping[plan] || plan;
            
            // Create user info object
            const userInfo = {
                name: customerName,
                email: customerEmail,
                phone: customerPhone
            };

            // Generate a temporary userId for this payment
            const userId = `temp_${Date.now()}`;

            console.log('Creating payment with:', { paymentCode, userId, plan: mappedPlan, amount, userInfo });

            // Create payment record
            await Payment.create({
                paymentId: paymentCode,
                userId,
                plan: mappedPlan,
                amount,
                userInfo
            });

            res.json({
                success: true,
                paymentId: paymentCode,
                message: 'Payment code created. Please transfer money and wait for auto verification.',
                bankInfo: {
                    accountNumber: config.bank.accountNumber,
                    accountName: config.bank.accountName,
                    bank: config.bank.bank,
                    branch: config.bank.branch,
                    amount: amount,
                    content: `FBENGAGE ${paymentCode}`
                }
            });

        } catch (error) {
            console.error('Bank transfer payment error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Check payment status
     */
    async checkStatus(req, res) {
        try {
            const { paymentCode } = req.params;
            const payment = await Payment.findById(paymentCode);

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    error: 'Payment not found'
                });
            }

            res.json({
                success: true,
                status: payment.status,
                paymentId: payment.id,
                amount: payment.amount,
                plan: payment.plan,
                createdAt: payment.created_at
            });

        } catch (error) {
            console.error('Check payment status error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Verify payment (admin only)
     */
    async verifyPayment(req, res) {
        try {
            const { paymentId, status } = req.body;

            // Update payment status
            await Payment.updateStatus(paymentId, status);

            // If approved, activate PRO license
            if (status === 'approved') {
                const payment = await Payment.findById(paymentId);
                if (payment) {
                    await this.activateProLicense(payment.user_id, payment.plan);
                }
            }

            res.json({
                success: true,
                message: 'Payment status updated'
            });

        } catch (error) {
            console.error('Payment verification error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get all payments (admin only)
     */
    async getAll(req, res) {
        try {
            const payments = await Payment.getAll();
            res.json({ success: true, payments });

        } catch (error) {
            console.error('Get payments error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get payments by user
     */
    async getByUser(req, res) {
        try {
            const { userId } = req.params;
            const payments = await Payment.getByUser(userId);

            res.json({ success: true, payments });

        } catch (error) {
            console.error('Get user payments error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Activate PRO license for user
     */
    async activateProLicense(userId, plan) {
        try {
            const expiresAt = calculateExpirationDate(plan);
            const result = await License.create({ userId, plan, expiresAt });

            // Update user to PRO
            await User.updateToPro(userId, plan);

            // Send license email
            const emailService = require('../utils/email');
            await emailService.sendLicenseEmail(userId, result.licenseKey, plan);

            console.log(`PRO license activated for user ${userId}, license: ${result.licenseKey}`);
            return result.licenseKey;

        } catch (error) {
            console.error('License activation error:', error);
            throw error;
        }
    }
}

module.exports = new PaymentController();
