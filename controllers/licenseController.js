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

            const license = await License.findByKeyAndUser(licenseKey, userId);

            if (!license) {
                return res.json({
                    valid: false,
                    message: 'License not found or invalid'
                });
            }

            // Check expiration
            if (License.isExpired(license.expires_at)) {
                // Update license status
                await License.updateStatus(licenseKey, 'expired');

                return res.json({
                    valid: false,
                    message: 'License expired'
                });
            }

            // Update user status
            await User.updateToPro(userId, license.plan);

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
            const result = await License.create({ userId, plan, expiresAt });

            // Update user to PRO
            await User.updateToPro(userId, plan);

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
            const licenses = await License.getAll();
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

            await License.updateStatus(licenseKey, status);

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
