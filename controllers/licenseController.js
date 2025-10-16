/**
 * License Controller
 * Handles license-related operations
 */

const License = require('../models/License');
const User = require('../models/User');
const { validateLicenseValidation } = require('../middleware/validation');

class LicenseController {
    /**
     * Validate license key
     */
    async validate(req, res) {
        try {
            const { licenseKey, userId, deviceId } = req.body;

            const licenseModel = new License();
            const license = await licenseModel.findByKeyAndUser(licenseKey, userId);

            if (!license) {
                return res.json({
                    valid: false,
                    message: 'License not found or invalid'
                });
            }

            // Check expiration
            if (License.isExpired(license.expires_at)) {
                // Update license status
                await licenseModel.updateStatus(licenseKey, 'expired');

                return res.json({
                    valid: false,
                    message: 'License expired'
                });
            }

            // Update user status
            const userModel = new User();
            await userModel.updateToPro(userId, license.plan);

            res.json({
                valid: true,
                expires: new Date(license.expires_at).getTime(),
                plan: license.plan
            });

        } catch (error) {
            console.error('Validation error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Create license (admin only)
     */
    async create(req, res) {
        try {
            const { userId, plan, expires } = req.body;

            const expiresAt = new Date(expires).toISOString();
            const licenseModel = new License();
            const result = await licenseModel.create({ userId, plan, expiresAt });

            // Update user to PRO
            const userModel = new User();
            await userModel.updateToPro(userId, plan);

            // Send license email
            const emailService = require('../utils/email');
            await emailService.sendLicenseEmail(userId, result.licenseKey, plan);

            res.json({
                success: true,
                licenseKey: result.licenseKey,
                expires: expiresAt
            });

        } catch (error) {
            console.error('Create license error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get all licenses (admin only)
     */
    async getAll(req, res) {
        try {
            const licenseModel = new License();
            const licenses = await licenseModel.getAll();
            res.json({ success: true, licenses });

        } catch (error) {
            console.error('Get licenses error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Update license status (admin only)
     */
    async updateStatus(req, res) {
        try {
            const { licenseKey, status } = req.body;

            const licenseModel = new License();
            await licenseModel.updateStatus(licenseKey, status);

            res.json({
                success: true,
                message: 'License status updated'
            });

        } catch (error) {
            console.error('Update license status error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new LicenseController();
