/**
 * Analytics Model
 * Handles all analytics-related database operations
 */

const database = require('../config/database');

class Analytics {
    constructor() {
        this.db = database.getConnection();
    }

    /**
     * Log an analytics event
     */
    async log(userId, eventType, eventData) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO analytics (user_id, event_type, event_data) VALUES (?, ?, ?)',
                [userId, eventType, JSON.stringify(eventData)],
                function (err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });
    }

    /**
     * Get analytics by user
     */
    async getByUser(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM analytics WHERE user_id = ? ORDER BY created_at DESC',
                [userId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    /**
     * Get all analytics (for admin)
     */
    async getAll() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM analytics ORDER BY created_at DESC', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    /**
     * Get analytics summary
     */
    async getSummary() {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT 
                    event_type,
                    COUNT(*) as count,
                    DATE(created_at) as date
                FROM analytics 
                GROUP BY event_type, DATE(created_at)
                ORDER BY date DESC
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = new Analytics();
