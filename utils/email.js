/**
 * Email Utility
 * Handles email sending functionality
 */

const nodemailer = require('nodemailer');
const config = require('../config');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        if (config.email.user && config.email.pass) {
            this.transporter = nodemailer.createTransporter({
                service: config.email.service,
                auth: {
                    user: config.email.user,
                    pass: config.email.pass
                }
            });
        }
    }

    /**
     * Send license activation email
     */
    async sendLicenseEmail(userId, licenseKey, plan) {
        if (!this.transporter) {
            console.log('Email service not configured, skipping email send');
            return;
        }

        try {
            const mailOptions = {
                from: config.email.user,
                to: userId, // In real app, get email from user record
                subject: 'FB Smart Engagement Pro - License Activated',
                html: `
                    <h2>🎉 PRO License Activated!</h2>
                    <p>Your license key: <strong>${licenseKey}</strong></p>
                    <p>Plan: ${plan}</p>
                    <p>Thank you for upgrading to PRO!</p>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('License email sent to:', userId);
        } catch (error) {
            console.error('Email sending error:', error);
        }
    }

    /**
     * Send payment confirmation email
     */
    async sendPaymentConfirmation(userId, paymentId, amount, plan) {
        if (!this.transporter) {
            console.log('Email service not configured, skipping email send');
            return;
        }

        try {
            const mailOptions = {
                from: config.email.user,
                to: userId,
                subject: 'FB Smart Engagement Pro - Payment Confirmed',
                html: `
                    <h2>✅ Payment Confirmed!</h2>
                    <p>Payment ID: ${paymentId}</p>
                    <p>Amount: $${amount}</p>
                    <p>Plan: ${plan}</p>
                    <p>Your PRO license will be activated shortly!</p>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('Payment confirmation email sent to:', userId);
        } catch (error) {
            console.error('Email sending error:', error);
        }
    }

    /**
     * Send trial reminder email
     */
    async sendTrialReminder(userId, daysLeft) {
        if (!this.transporter) {
            console.log('Email service not configured, skipping email send');
            return;
        }

        try {
            const mailOptions = {
                from: config.email.user,
                to: userId,
                subject: `FB Smart Engagement Pro - Trial Expires in ${daysLeft} days`,
                html: `
                    <h2>⏰ Trial Expiring Soon!</h2>
                    <p>Your trial expires in ${daysLeft} days.</p>
                    <p>Upgrade to PRO to continue using all features!</p>
                    <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment">Upgrade Now</a></p>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('Trial reminder email sent to:', userId);
        } catch (error) {
            console.error('Email sending error:', error);
        }
    }
}

module.exports = new EmailService();
