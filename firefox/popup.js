/**
 * Facebook Smart Engagement Pro - Popup Script (Firefox Compatible)
 * Facebook Auto Reaction Assistant
 *
 * Chức năng:
 * - Premium UI với tất cả tính năng đã mở khóa
 * - Safety settings và monitoring
 * - Human behavior controls
 * - Activity tracking và limits
 * - Monetization ready
 *
 * Firefox Compatibility Changes:
 * - Uses browser.* APIs instead of chrome.*
 * - Firefox-specific storage handling
 * - Compatible message passing
 */

document.addEventListener("DOMContentLoaded", function () {
    'use strict';

    // Firefox compatibility: Use browser namespace instead of chrome
    const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

    // ==================== GLOBAL VARIABLES ====================
    let currentSettings = {
        startup: false,
        ignore_fp: false,
        ignore_gr: false,
        time_period: 5,
        blacklist: '',
        // Safety settings
        working_hours_only: false,
        weekdays_only: false,
        max_reactions_hour: 20,
        max_reactions_day: 100,
        delay_reactions: 3
    };

    // ==================== INITIALIZATION ====================

    /**
     * Khởi tạo popup
     */
    async function initPopup() {
        console.log('Initializing popup...');

        await loadSettings();
        await updateUI();
        setupEventListeners();
        await checkProStatus();
        await checkTrialStatus();

        console.log('Popup initialized successfully');
    }

    // ==================== SETTINGS MANAGEMENT ====================

    /**
     * Tải cài đặt từ storage (Firefox compatible)
     */
    async function loadSettings() {
        try {
            const result = await browserAPI.storage.local.get([
                'startup', 'ignore_fp', 'ignore_gr', 'time_period', 'blacklist',
                'working_hours_only', 'weekdays_only', 'max_reactions_hour',
                'max_reactions_day', 'delay_reactions'
            ]);

            currentSettings = {
                startup: result.startup || false,
                ignore_fp: result.ignore_fp || false,
                ignore_gr: result.ignore_gr || false,
                time_period: result.time_period || 5,
                blacklist: result.blacklist || '',
                // Safety settings
                working_hours_only: result.working_hours_only || false,
                weekdays_only: result.weekdays_only || false,
                max_reactions_hour: result.max_reactions_hour || 20,
                max_reactions_day: result.max_reactions_day || 100,
                delay_reactions: result.delay_reactions || 3
            };

            console.log('Settings loaded:', currentSettings);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    /**
     * Lưu cài đặt vào storage (Firefox compatible)
     */
    async function saveSettings() {
        try {
            await browserAPI.storage.local.set(currentSettings);
            console.log('Settings saved:', currentSettings);
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    // ==================== UI MANAGEMENT ====================

    /**
     * Cập nhật giao diện
     */
    async function updateUI() {
        // Cập nhật form elements
        document.getElementById('startup').checked = currentSettings.startup;
        document.getElementById('ignore-fp').checked = currentSettings.ignore_fp;
        document.getElementById('ignore-gr').checked = currentSettings.ignore_gr;
        document.getElementById('time-period').value = currentSettings.time_period;
        document.getElementById('blacklist').value = currentSettings.blacklist;

        // Safety settings
        document.getElementById('working-hours-only').checked = currentSettings.working_hours_only;
        document.getElementById('weekdays-only').checked = currentSettings.weekdays_only;
        document.getElementById('max-reactions-hour').value = currentSettings.max_reactions_hour;
        document.getElementById('max-reactions-day').value = currentSettings.max_reactions_day;
        document.getElementById('delay-reactions').value = currentSettings.delay_reactions;

        // Cập nhật nút start/stop
        await updateStartStopButton();

        // Cập nhật version
        const manifest = browserAPI.runtime.getManifest();
        document.getElementById('version').textContent = 'v' + manifest.version;
    }

    /**
     * Cập nhật nút start/stop (Firefox compatible)
     */
    async function updateStartStopButton() {
        try {
            const alarm = await browserAPI.alarms.get('autoReaction');
            const button = document.getElementById('btStart');

            if (alarm && alarm.name === 'autoReaction') {
                button.textContent = getMessage('stop');
                button.className = 'btn btn-danger';
            } else {
                button.textContent = getMessage('start');
                button.className = 'btn btn-success';
            }
        } catch (error) {
            console.error('Error updating button:', error);
        }
    }

    // ==================== LOCALIZATION ====================

    /**
     * Lấy message đã được dịch
     * @param {string} key - Message key
     * @returns {string} Translated message
     */
    function getMessage(key) {
        // Hardcoded messages since we removed i18n
        const messages = {
            'setting': 'Cài đặt',
            'appName': 'FB Smart Engagement Pro',
            'start': 'Kích hoạt',
            'stop': 'Dừng lại'
        };
        return messages[key] || key;
    }

    /**
     * Localize các elements
     */
    function localizeElements() {
        // No need to localize since we removed i18n
        console.log('Localization skipped - using hardcoded text');
    }

    // ==================== EVENT LISTENERS ====================

    /**
     * Thiết lập event listeners
     */
    function setupEventListeners() {
        console.log('Setting up event listeners...');

        try {
            // Navigation buttons
            setupNavigationListeners();

            // Settings change handlers
            setupSettingsListeners();
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }

        // Start/Stop button
        setupStartStopListener();

        // Blacklist input validation
        setupBlacklistValidation();

        // Pro link
        setupProLinkListener();
    }

    /**
     * Thiết lập navigation listeners
     */
    function setupNavigationListeners() {
        // Check if buttons exist
        const btnSetting = document.getElementById('btn-setting');
        const btnHome = document.getElementById('btn-home');

        if (!btnSetting) {
            console.error('btn-setting button not found!');
            return;
        }

        if (!btnHome) {
            console.error('btn-home button not found!');
            return;
        }

        console.log('Navigation buttons found, setting up listeners...');

        // Settings page navigation
        btnSetting.addEventListener('click', function () {
            console.log('Settings button clicked');
            const mainPage = document.querySelector('.main-page');
            const secondPage = document.querySelector('.second-page');
            const btnHome = document.getElementById('btn-home');
            const btnSetting = document.getElementById('btn-setting');
            const title = document.getElementById('title');

            console.log('Elements found:', {
                mainPage: !!mainPage,
                secondPage: !!secondPage,
                btnHome: !!btnHome,
                btnSetting: !!btnSetting,
                title: !!title
            });

            // Hide main page, show settings page
            mainPage.style.display = 'none';
            secondPage.style.display = 'block';
            secondPage.style.left = '0px'; // Reset left position

            // Toggle buttons
            btnHome.style.display = 'block';
            btnSetting.style.display = 'none';

            // Update title
            title.textContent = getMessage('setting');
        });

        // Home page navigation
        btnHome.addEventListener('click', function () {
            console.log('Home button clicked');
            const mainPage = document.querySelector('.main-page');
            const secondPage = document.querySelector('.second-page');
            const btnHome = document.getElementById('btn-home');
            const btnSetting = document.getElementById('btn-setting');
            const title = document.getElementById('title');

            // Show main page, hide settings page
            mainPage.style.display = 'block';
            secondPage.style.display = 'none';
            secondPage.style.left = '360px'; // Reset to original position

            // Toggle buttons
            btnHome.style.display = 'none';
            btnSetting.style.display = 'block';

            // Update title
            title.textContent = getMessage('appName');
        });
    }

    /**
     * Thiết lập settings listeners
     */
    function setupSettingsListeners() {
        // Startup setting
        document.getElementById('startup').addEventListener('change', function () {
            currentSettings.startup = this.checked;
            saveSettings();
        });

        // Ignore fanpage setting
        document.getElementById('ignore-fp').addEventListener('change', function () {
            currentSettings.ignore_fp = this.checked;
            saveSettings();
        });

        // Ignore group setting
        document.getElementById('ignore-gr').addEventListener('change', function () {
            currentSettings.ignore_gr = this.checked;
            saveSettings();
        });

        // Time period setting
        document.getElementById('time-period').addEventListener('change', function () {
            currentSettings.time_period = parseInt(this.value);
            saveSettings();
        });

        // Blacklist setting
        document.getElementById('blacklist').addEventListener('change', function () {
            currentSettings.blacklist = this.value;
            saveSettings();
        });

        // Safety settings
        document.getElementById('working-hours-only').addEventListener('change', function () {
            currentSettings.working_hours_only = this.checked;
            saveSettings();
        });

        document.getElementById('weekdays-only').addEventListener('change', function () {
            currentSettings.weekdays_only = this.checked;
            saveSettings();
        });

        document.getElementById('max-reactions-hour').addEventListener('change', function () {
            currentSettings.max_reactions_hour = parseInt(this.value);
            saveSettings();
        });

        document.getElementById('max-reactions-day').addEventListener('change', function () {
            currentSettings.max_reactions_day = parseInt(this.value);
            saveSettings();
        });

        document.getElementById('delay-reactions').addEventListener('change', function () {
            currentSettings.delay_reactions = parseInt(this.value);
            saveSettings();
        });
    }

    /**
     * Thiết lập start/stop button listener (Firefox compatible)
     */
    function setupStartStopListener() {
        document.getElementById('btStart').addEventListener('click', async function () {
            const button = this;
            const alarm = await browserAPI.alarms.get('autoReaction');

            if (alarm && alarm.name === 'autoReaction') {
                // Dừng auto reaction
                await browserAPI.alarms.clear('autoReaction');
                button.textContent = getMessage('start');
                button.className = 'btn btn-success';
                console.log('Auto reaction stopped');
            } else {
                // Bắt đầu auto reaction
                await browserAPI.alarms.clear('autoReaction');
                await browserAPI.alarms.create('autoReaction', {
                    delayInMinutes: 1,
                    periodInMinutes: currentSettings.time_period
                });
                button.textContent = getMessage('stop');
                button.className = 'btn btn-danger';
                console.log(`Auto reaction started with ${currentSettings.time_period} minute interval`);
            }
        });
    }

    /**
     * Thiết lập blacklist validation
     */
    function setupBlacklistValidation() {
        // Chỉ cho phép số và dấu phẩy
        const allowedKeys = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 188]; // 0-9 và comma
        document.getElementById('blacklist').addEventListener('keypress', function (e) {
            if (!allowedKeys.includes(e.which)) {
                e.preventDefault();
            }
        });
    }

    /**
     * Thiết lập pro link listener (Firefox compatible)
     */
    function setupProLinkListener() {
        document.getElementById('ic-plus').addEventListener('click', async function () {
            const userId = await getUserId();
            browserAPI.tabs.create({
                url: 'https://www.facebook.com/dinhkhanhtung'
            });
        });
    }

    // ==================== USER ID MANAGEMENT ====================

    /**
     * Lấy User ID từ cookies (Firefox compatible)
     * @returns {string} User ID
     */
    async function getUserId() {
        try {
            const cookies = await browserAPI.cookies.get({
                url: 'https://www.facebook.com',
                name: 'c_user'
            });
            return cookies ? cookies.value : '';
        } catch (error) {
            console.error('Error getting user ID:', error);
            return '';
        }
    }

    // ==================== PRO STATUS MANAGEMENT ====================

    /**
     * Kiểm tra trạng thái PRO - TẤT CẢ TÍNH NĂNG ĐÃ ĐƯỢC MỞ KHÓA
     */
    async function checkProStatus() {
        // Bỏ qua kiểm tra PRO server, mở khóa tất cả tính năng
        console.log('All premium features unlocked - no server check needed');
        updateProStatus(true, 9999999999); // Luôn trả về PRO với thời gian vô hạn
    }

    /**
     * Cập nhật UI trạng thái PRO - TẤT CẢ TÍNH NĂNG ĐÃ ĐƯỢC MỞ KHÓA
     * @param {boolean} isPro - Có phải PRO không (luôn true)
     * @param {number} expiryTime - Thời gian hết hạn (không cần thiết)
     */
    function updateProStatus(isPro, expiryTime) {
        const proTimeElement = document.getElementById('pro-time');

        // Luôn hiển thị "Unlimited" cho tất cả users
        proTimeElement.textContent = 'Unlimited';
        proTimeElement.style.color = '#28a745'; // Green color

        // BẬT TẤT CẢ SETTINGS CHO MỌI USER
        enableSettings(true);
        console.log('All premium features unlocked for all users!');
    }

    /**
     * Bật/tắt settings
     * @param {boolean} enabled - Bật hay tắt
     */
    function enableSettings(enabled) {
        const settings = [
            'startup', 'ignore-fp', 'ignore-gr', 'time-period', 'blacklist',
            'working-hours-only', 'weekdays-only', 'max-reactions-hour',
            'max-reactions-day', 'delay-reactions'
        ];

        settings.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.disabled = !enabled;
            }
        });
    }

    // ==================== TRIAL & SUBSCRIPTION FUNCTIONS ====================

    /**
     * Kiểm tra trạng thái trial (Firefox compatible)
     */
    async function checkTrialStatus() {
        try {
            const response = await browserAPI.runtime.sendMessage({ type: 'GET_USER_STATUS' });

            if (response) {
                updateTrialUI(response);
            }
        } catch (error) {
            console.error('Error checking trial status:', error);
        }
    }

    /**
     * Cập nhật UI theo trạng thái trial
     */
    function updateTrialUI(userStatus) {
        const trialStatus = document.getElementById('trial-status');
        const proStatus = document.getElementById('pro-status');
        const upgradePrompt = document.getElementById('upgrade-prompt');
        const trialTime = document.getElementById('trial-time');
        const proPlan = document.getElementById('pro-plan');

        // Hide all status elements
        trialStatus.style.display = 'none';
        proStatus.style.display = 'none';
        upgradePrompt.style.display = 'none';

        if (userStatus.isPro) {
            // PRO user
            proStatus.style.display = 'block';
            proPlan.textContent = userStatus.plan === 'pro_monthly' ? 'Monthly Plan' : 'Yearly Plan';
        } else if (userStatus.isTrial) {
            // Trial user
            const now = Date.now();
            const trialEnd = userStatus.trialStart + (3 * 24 * 60 * 60 * 1000); // 3 days
            const remaining = Math.max(0, trialEnd - now);
            const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
            const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

            trialStatus.style.display = 'block';
            if (days > 0) {
                trialTime.textContent = `${days} ngày còn lại`;
            } else {
                trialTime.textContent = `${hours} giờ còn lại`;
            }
        } else {
            // Trial expired - show upgrade prompt
            upgradePrompt.style.display = 'block';
        }
    }

    /**
     * Setup upgrade button (Firefox compatible)
     */
    function setupUpgradeButton() {
        const upgradeBtn = document.getElementById('upgrade-btn');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                browserAPI.runtime.sendMessage({ type: 'OPEN_PAYMENT' });
            });
        }
    }

    // Khởi tạo popup
    localizeElements();
    initPopup();
    setupUpgradeButton();

    console.log('Smart Auto Reaction for FB popup script loaded (Firefox compatible)');
});
