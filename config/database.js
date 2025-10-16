/**
 * Database Configuration
 * Handles database connection and initialization
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        // Use in-memory database for Vercel deployment
        this.db = new sqlite3.Database(':memory:');
        this.initializeTables();
    }

    initializeTables() {
        this.db.serialize(() => {
            // Users table
            this.db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id VARCHAR(255) UNIQUE NOT NULL,
                device_id VARCHAR(255),
                email VARCHAR(255),
                trial_start DATETIME,
                is_trial BOOLEAN DEFAULT 1,
                is_pro BOOLEAN DEFAULT 0,
                plan VARCHAR(50) DEFAULT 'trial',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_active DATETIME
            )`);

            // Licenses table
            this.db.run(`CREATE TABLE IF NOT EXISTS licenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id VARCHAR(255),
                license_key VARCHAR(255) UNIQUE,
                plan VARCHAR(50),
                expires_at DATETIME,
                status VARCHAR(50) DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Payments table
            this.db.run(`CREATE TABLE IF NOT EXISTS payments (
                id VARCHAR(255) PRIMARY KEY,
                user_id VARCHAR(255),
                plan VARCHAR(50),
                amount DECIMAL(10,2),
                status VARCHAR(50) DEFAULT 'pending',
                transaction_id VARCHAR(255),
                bank_info TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                verified_at DATETIME
            )`);

            // Analytics table
            this.db.run(`CREATE TABLE IF NOT EXISTS analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id VARCHAR(255),
                event_type VARCHAR(100),
                event_data TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
        });
    }

    getConnection() {
        return this.db;
    }

    close() {
        this.db.close();
    }
}

module.exports = new Database();
