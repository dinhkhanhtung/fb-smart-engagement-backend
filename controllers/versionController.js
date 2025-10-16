/**
 * Version Controller
 * Handles version management and update notifications
 */

class VersionController {
    constructor() {
        this.currentVersion = '1.2.0';
        this.minSupportedVersion = '1.0.0';
        this.updateNotifications = [];
    }

    /**
     * Get current version info
     */
    async getVersionInfo(req, res) {
        try {
            const versionInfo = {
                current_version: this.currentVersion,
                min_supported_version: this.minSupportedVersion,
                release_date: '2024-01-15',
                update_available: false,
                update_required: false,
                changelog: [
                    '🚀 Auto-activation system',
                    '📱 Mobile responsive design',
                    '🔧 Bug fixes và performance improvements',
                    '🎨 UI/UX enhancements'
                ],
                download_urls: {
                    chrome: '/download/chrome',
                    firefox: '/download/firefox'
                }
            };

            res.json({ success: true, version: versionInfo });
        } catch (error) {
            console.error('Get version info error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Check if user needs update
     */
    async checkUserVersion(req, res) {
        try {
            const { user_version, user_id } = req.body;
            
            if (!user_version) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'User version is required' 
                });
            }

            const currentVersion = this.currentVersion;
            const isUpdateAvailable = this.compareVersions(user_version, currentVersion) < 0;
            const isUpdateRequired = this.compareVersions(user_version, this.minSupportedVersion) < 0;

            const response = {
                success: true,
                update_available: isUpdateAvailable,
                update_required: isUpdateRequired,
                current_version: currentVersion,
                user_version: user_version,
                message: this.getMessage(isUpdateAvailable, isUpdateRequired)
            };

            // Log version check
            console.log(`Version check for user ${user_id}: ${user_version} -> ${currentVersion}`);

            res.json(response);
        } catch (error) {
            console.error('Check user version error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Compare two version strings
     */
    compareVersions(version1, version2) {
        const v1parts = version1.split('.').map(Number);
        const v2parts = version2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
            const v1part = v1parts[i] || 0;
            const v2part = v2parts[i] || 0;
            
            if (v1part < v2part) return -1;
            if (v1part > v2part) return 1;
        }
        
        return 0;
    }

    /**
     * Get appropriate message based on update status
     */
    getMessage(updateAvailable, updateRequired) {
        if (updateRequired) {
            return 'Cập nhật bắt buộc! Vui lòng cập nhật để tiếp tục sử dụng.';
        } else if (updateAvailable) {
            return 'Có phiên bản mới! Cập nhật để trải nghiệm tính năng mới.';
        } else {
            return 'Bạn đang sử dụng phiên bản mới nhất.';
        }
    }

    /**
     * Get update notifications for admin
     */
    async getUpdateNotifications(req, res) {
        try {
            const notifications = [
                {
                    id: 1,
                    version: '1.2.0',
                    title: 'Phiên bản mới 1.2.0',
                    message: 'Auto-activation system và mobile responsive design',
                    release_date: '2024-01-15',
                    users_notified: 1250,
                    users_updated: 890,
                    update_rate: 71.2
                },
                {
                    id: 2,
                    version: '1.1.0',
                    title: 'Phiên bản 1.1.0',
                    message: 'Bug fixes và performance improvements',
                    release_date: '2024-01-10',
                    users_notified: 2100,
                    users_updated: 1800,
                    update_rate: 85.7
                }
            ];

            res.json({ success: true, notifications });
        } catch (error) {
            console.error('Get update notifications error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Send update notification to users
     */
    async sendUpdateNotification(req, res) {
        try {
            const { version, message, target_users } = req.body;
            
            // Simulate sending notifications
            const notification = {
                version,
                message,
                target_users: target_users || 'all',
                sent_at: new Date(),
                status: 'sent'
            };

            console.log(`Update notification sent for version ${version}:`, notification);

            res.json({ 
                success: true, 
                message: 'Update notification sent successfully',
                notification 
            });
        } catch (error) {
            console.error('Send update notification error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new VersionController();
