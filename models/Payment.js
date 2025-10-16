/**
 * Payment Model
 * Handles all payment-related database operations
 */

const database = require('../config/database');

class Payment {
    constructor() {
        this.db = database.getConnection();
    }

    /**
     * Create a new payment record
     */
    async create(paymentData) {
        return new Promise((resolve, reject) => {
            const { paymentId, userId, plan, amount, userInfo } = paymentData;

            this.db.run(`
                INSERT INTO payments (id, user_id, plan, amount, status, transaction_id, bank_info, created_at)
                VALUES (?, ?, ?, ?, 'pending', ?, ?, datetime('now'))
            `, [paymentId, userId, plan, amount, paymentId, JSON.stringify(userInfo)], (err) => {
                if (err) reject(err);
                else resolve({ paymentId });
            });
        });
    }

    /**
     * Find payment by ID
     */
    async findById(paymentId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM payments WHERE id = ?', [paymentId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    /**
     * Update payment status
     */
    async updateStatus(paymentId, status) {
        return new Promise((resolve, reject) => {
            this.db.run(`
                UPDATE payments 
                SET status = ?, verified_at = datetime('now')
                WHERE id = ?
            `, [status, paymentId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    /**
     * Get all payments (for admin)
     */
    async getAll() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM payments ORDER BY created_at DESC', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    /**
     * Get payments by user
     */
    async getByUser(userId) {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = new Payment();
