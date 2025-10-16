/**
 * License Model
 * Handles all license-related database operations
 */

const database = require('../config/database');
const crypto = require('crypto');

class License {
    constructor() {
        this.db = database.getConnection();
    }

    /**
     * Generate unique license key
     */
    generateLicenseKey() {
        const prefix = 'LIC';
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(8).toString('hex');
        return `${prefix}-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Create a new license
     */
    async create(licenseData) {
        return new Promise((resolve, reject) => {
            const { userId, plan, expiresAt } = licenseData;
            const licenseKey = this.generateLicenseKey();

            this.db.run(
                'INSERT INTO licenses (user_id, license_key, plan, expires_at) VALUES (?, ?, ?, ?)',
                [userId, licenseKey, plan, expiresAt],
                function (err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, licenseKey, expiresAt });
                }
            );
        });
    }

    /**
     * Find license by key and user
     */
    async findByKeyAndUser(licenseKey, userId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM licenses WHERE license_key = ? AND user_id = ? AND status = "active"',
                [licenseKey, userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    /**
     * Update license status
     */
    async updateStatus(licenseKey, status) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE licenses SET status = ? WHERE license_key = ?',
                [status, licenseKey],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    /**
     * Get all licenses (for admin)
     */
    async getAll() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM licenses ORDER BY created_at DESC', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    /**
     * Check if license is expired
     */
    isExpired(expiresAt) {
        const now = new Date();
        const expires = new Date(expiresAt);
        return now > expires;
    }
}

module.exports = new License();
