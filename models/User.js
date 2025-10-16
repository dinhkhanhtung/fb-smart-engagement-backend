/**
 * User Model
 * Handles all user-related database operations
 */

const database = require('../config/database');

class User {
    constructor() {
        this.db = database.getConnection();
    }

    /**
     * Create a new user
     */
    async create(userData) {
        return new Promise((resolve, reject) => {
            const { userId, deviceId, email } = userData;
            const trialStart = new Date().toISOString();

            this.db.run(
                'INSERT INTO users (user_id, device_id, email, trial_start, is_trial) VALUES (?, ?, ?, ?, ?)',
                [userId, deviceId, email, trialStart, true],
                function (err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, userId, trialStart });
                }
            );
        });
    }

    /**
     * Find user by ID
     */
    async findById(userId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE user_id = ?', [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    /**
     * Update user status to PRO
     */
    async updateToPro(userId, plan) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE users SET is_pro = 1, is_trial = 0, plan = ? WHERE user_id = ?',
                [plan, userId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    /**
     * Update user's last active time
     */
    async updateLastActive(userId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE users SET last_active = datetime("now") WHERE user_id = ?',
                [userId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    /**
     * Get all users (for admin)
     */
    async getAll() {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT u.*, l.license_key, l.expires_at, l.status as license_status
                FROM users u
                LEFT JOIN licenses l ON u.user_id = l.user_id
                ORDER BY u.created_at DESC
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    /**
     * Get user analytics
     */
    async getAnalytics() {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT 
                    COUNT(*) as total_users,
                    SUM(CASE WHEN is_pro = 1 THEN 1 ELSE 0 END) as pro_users,
                    SUM(CASE WHEN is_trial = 1 THEN 1 ELSE 0 END) as trial_users,
                    SUM(CASE WHEN plan = 'pro_monthly' THEN 1 ELSE 0 END) as monthly_users,
                    SUM(CASE WHEN plan = 'pro_yearly' THEN 1 ELSE 0 END) as yearly_users
                FROM users
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    /**
     * Set activation flag for user
     */
    async setActivationFlag(userId, activationData) {
        return new Promise((resolve, reject) => {
            this.db.run(`
                UPDATE users 
                SET activation_data = ?, last_updated = datetime('now')
                WHERE user_id = ?
            `, [JSON.stringify(activationData), userId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    /**
     * Get activation flag for user
     */
    async getActivationFlag(userId) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT activation_data FROM users 
                WHERE user_id = ?
            `, [userId], (err, row) => {
                if (err) reject(err);
                else {
                    if (row && row.activation_data) {
                        try {
                            resolve(JSON.parse(row.activation_data));
                        } catch (e) {
                            resolve(null);
                        }
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }

    /**
     * Update user PRO status
     */
    async updateProStatus(userId, isPro, plan) {
        return new Promise((resolve, reject) => {
            this.db.run(`
                UPDATE users 
                SET is_pro = ?, plan = ?, last_updated = datetime('now')
                WHERE user_id = ?
            `, [isPro ? 1 : 0, plan, userId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

module.exports = new User();
