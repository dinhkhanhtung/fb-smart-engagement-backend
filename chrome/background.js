/**
 * Facebook Smart Engagement Pro - Background Script
 * Facebook Auto Reaction Assistant
 * 
 * Chức năng chính:
 * - Smart reaction selection với thuật toán thông minh
 * - Safety features để tránh bị khóa tài khoản
 * - Human behavior simulation
 * - Activity limits và monitoring
 * - Trial system (3 days free)
 * - PRO subscription management
 */

(function () {
    'use strict';

    // ==================== CONFIGURATION ====================
    const CONFIG = {
        // Facebook API URLs
        GRAPH_URL: 'https://graph.facebook.com/v18.0/',
        MBASIC_URL: 'https://mbasic.facebook.com',
        M_URL: 'https://m.facebook.com',
        W3_URL: 'https://www.facebook.com',

        // Reaction types (theo thứ tự Facebook)
        REACTIONS: ['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'],

        // Thresholds
        MIN_REACTIONS: 10,           // Số reaction tối thiểu để xử lý
        MAX_LIKE_COUNT: 5,           // Số like tối đa trước khi chọn reaction khác

        // Delays (milliseconds) - Cân bằng giữa tốc độ và an toàn
        DELAY_BETWEEN_REACTIONS: 3000,  // 3 giây giữa các reaction
        DELAY_BETWEEN_POSTS: 2000,      // 2 giây giữa các bài viết
        DELAY_BETWEEN_REQUESTS: 1000,   // 1 giây giữa các request

        // TRIAL SYSTEM - Hệ thống dùng thử
        TRIAL_DAYS: 3,                   // 3 ngày dùng thử
        FREE_REACTIONS_PER_DAY: 10,      // FREE: 10 reactions/ngày
        PRO_REACTIONS_PER_HOUR: 50,      // PRO: 50 reactions/giờ
        PRO_REACTIONS_PER_DAY: 500,      // PRO: 500 reactions/ngày

        // SAFETY LIMITS - Giới hạn an toàn
        MAX_REACTIONS_PER_HOUR: 20,     // Tối đa 20 reactions/giờ
        MAX_REACTIONS_PER_DAY: 100,     // Tối đa 100 reactions/ngày
        MAX_SESSION_DURATION: 3600000,  // Session tối đa 60 phút
        MIN_BREAK_TIME: 120000,          // Nghỉ tối thiểu 2 phút giữa các session
        WORKING_HOURS_ONLY: false,       // Hoạt động 24/7
        WEEKDAYS_ONLY: false             // Hoạt động cả cuối tuần
    };

    // ==================== GLOBAL VARIABLES ====================
    let userToken = null;      // Facebook access token
    let userID = null;         // User ID từ cookie
    let dtsgToken = null;      // DTSG token cho requests
    let processedPosts = new Set();  // Danh sách bài viết đã xử lý
    let isRunning = false;     // Trạng thái đang chạy

    // SAFETY TRACKING - Theo dõi hoạt động để tránh bị phát hiện
    let activityTracker = {
        reactionsToday: 0,
        reactionsThisHour: 0,
        sessionStart: null,
        lastActivity: null,
        dailyReset: new Date().toDateString()
    };

    // ==================== TRIAL & SUBSCRIPTION SYSTEM ====================
    let userStatus = {
        isTrial: true,
        trialStart: null,
        isPro: false,
        licenseKey: null,
        expires: null,
        plan: 'free'
    };

    // ==================== INITIALIZATION ====================

    /**
     * Khởi tạo extension khi cài đặt
     */
    chrome.runtime.onInstalled.addListener(async (details) => {
        if (details.reason === 'install') {
            // Initialize trial system
            await initializeTrialSystem();

            // Mở trang chủ khi cài đặt lần đầu
            chrome.tabs.create({ url: 'https://www.facebook.com/dinhkhanhtung' });

            // Auto-start extension
            console.log('Extension installed - starting auto reaction...');
            setTimeout(() => {
                performAutoReaction();
            }, 5000); // Start after 5 seconds
        }
    });

    // Auto-start khi có tab Facebook được mở
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && tab.url && tab.url.includes('facebook.com')) {
            console.log('Facebook tab detected - starting auto reaction...');
            setTimeout(() => {
                performAutoReaction();
            }, 3000); // Start after 3 seconds
        }
    });

    // ==================== SETTINGS MANAGEMENT ====================

    /**
     * Lấy cài đặt từ storage
     * @returns {Object} Cài đặt hiện tại
     */
    async function getSettings() {
        try {
            const result = await chrome.storage.local.get([
                'startup', 'ignore_fp', 'ignore_gr', 'blacklist', 'time_period',
                'working_hours_only', 'weekdays_only', 'max_reactions_hour',
                'max_reactions_day', 'delay_reactions'
            ]);

            return {
                startup: result.startup || false,
                ignore_fp: result.ignore_fp || false,
                ignore_gr: result.ignore_gr || false,
                blacklist: result.blacklist || '',
                time_period: result.time_period || 5,
                // Safety settings
                working_hours_only: result.working_hours_only || false,
                weekdays_only: result.weekdays_only || false,
                max_reactions_hour: result.max_reactions_hour || 20,
                max_reactions_day: result.max_reactions_day || 100,
                delay_reactions: result.delay_reactions || 3
            };
        } catch (error) {
            console.error('Error loading settings:', error);
            return {
                startup: false,
                ignore_fp: false,
                ignore_gr: false,
                blacklist: '',
                time_period: 5,
                // Safety settings defaults
                working_hours_only: false,
                weekdays_only: false,
                max_reactions_hour: 20,
                max_reactions_day: 100,
                delay_reactions: 3
            };
        }
    }

    // ==================== FACEBOOK AUTHENTICATION ====================

    /**
     * Lấy thông tin xác thực Facebook
     * @returns {boolean} True nếu thành công
     */
    async function getFacebookAuth() {
        try {
            console.log('Getting Facebook authentication...');

            // Lấy cookies Facebook
            const cookies = await chrome.cookies.getAll({ domain: '.facebook.com' });
            const c_user = cookies.find(c => c.name === 'c_user');
            const xs = cookies.find(c => c.name === 'xs');

            if (!c_user || !xs) {
                console.log('Facebook cookies not found');
                return false;
            }

            userID = c_user.value;
            console.log('User ID found:', userID);

            // Lấy access token từ Facebook
            const response = await fetch(`${CONFIG.M_URL}/composer/ocelot/async_loader/?publisher=feed`, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();

            // Trích xuất tokens từ HTML
            const dtsgMatch = html.match(/"DTSGInitialData",\[\],{"token":"([^"]+)"/);
            const tokenMatch = html.match(/"accessToken":"([^"]+)"/);

            if (dtsgMatch) {
                dtsgToken = dtsgMatch[1];
                console.log('DTSG token found');
            }

            if (tokenMatch) {
                userToken = tokenMatch[1];
                console.log('Access token found');
            }

            const success = !!(dtsgToken && userToken);
            console.log('Authentication result:', success);
            return success;

        } catch (error) {
            console.error('Error getting Facebook auth:', error);
            return false;
        }
    }

    // ==================== NEWS FEED PROCESSING ====================

    /**
     * Lấy danh sách bài viết từ news feed
     * @returns {Array} Danh sách bài viết
     */
    async function getNewsFeedPosts() {
        try {
            console.log('Fetching news feed posts...');

            const response = await fetch(`${CONFIG.MBASIC_URL}/stories.php`, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            const posts = [];

            // Parse bài viết từ HTML - cập nhật selectors cho Facebook 2025
            const postMatches = html.match(/<article[^>]*data-ft="([^"]*)"[^>]*>/g);

            if (postMatches) {
                postMatches.forEach(match => {
                    const dataFtMatch = match.match(/data-ft="([^"]*)"/);
                    if (dataFtMatch) {
                        try {
                            const dataFt = JSON.parse(dataFtMatch[1].replace(/&quot;/g, '"'));

                            // Chỉ lấy bài viết có đầy đủ thông tin
                            if (dataFt.top_level_post_id && dataFt.content_owner_id_new) {
                                posts.push({
                                    postId: dataFt.top_level_post_id,
                                    ownerId: dataFt.content_owner_id_new,
                                    pageId: dataFt.page_id,
                                    groupId: dataFt.group_id
                                });
                            }
                        } catch (e) {
                            console.log('Error parsing post data:', e);
                        }
                    }
                });
            }

            console.log(`Found ${posts.length} posts`);
            return posts;

        } catch (error) {
            console.error('Error getting news feed posts:', error);
            return [];
        }
    }

    // ==================== REACTION ANALYSIS ====================

    /**
     * Lấy số lượng reaction của một bài viết
     * @param {string} postId - ID bài viết
     * @returns {Array|null} Mảng số lượng reaction hoặc null nếu lỗi
     */
    async function getReactionCounts(postId) {
        try {
            // Tạo fields cho Graph API
            const fields = CONFIG.REACTIONS.map(reaction =>
                `reactions.type(${reaction.toUpperCase()}).limit(0).summary(total_count).as(reactions_${reaction})`
            ).join(',');

            const url = `${CONFIG.GRAPH_URL}${postId}?fields=${fields}&access_token=${userToken}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Trích xuất số lượng reaction
            const counts = CONFIG.REACTIONS.map(reaction =>
                data[`reactions_${reaction}`]?.summary?.total_count || 0
            );

            console.log(`Reaction counts for post ${postId}:`, counts);
            return counts;

        } catch (error) {
            console.error('Error getting reaction counts:', error);
            return null;
        }
    }

    /**
     * Chọn reaction phù hợp nhất dựa trên số lượng
     * @param {Array} counts - Mảng số lượng reaction
     * @returns {number} Index của reaction được chọn (-1 nếu bỏ qua)
     */
    function chooseReaction(counts) {
        const totalReactions = counts.reduce((sum, count) => sum + count, 0);

        // Bỏ qua nếu ít reaction
        if (totalReactions < CONFIG.MIN_REACTIONS) {
            console.log('Skipping post - too few reactions');
            return -1;
        }

        // Tìm reaction có số lượng cao nhất
        let maxCount = counts[0];
        let bestReaction = 0;

        for (let i = 1; i < counts.length; i++) {
            if (counts[i] > maxCount) {
                maxCount = counts[i];
                bestReaction = i;
            }
        }

        // Nếu like có quá nhiều reaction, chọn reaction khác
        if (bestReaction === 0 && counts[0] > CONFIG.MAX_LIKE_COUNT) {
            const remainingCounts = counts.slice(1);
            const secondBest = remainingCounts.indexOf(Math.max(...remainingCounts)) + 1;

            if (counts[secondBest] > CONFIG.MAX_LIKE_COUNT) {
                console.log(`Choosing ${CONFIG.REACTIONS[secondBest]} instead of like`);
                return secondBest;
            }
        }

        console.log(`Choosing ${CONFIG.REACTIONS[bestReaction]} reaction`);
        return bestReaction;
    }

    // ==================== REACTION EXECUTION ====================

    /**
     * Thực hiện reaction cho một bài viết
     * @param {string} postId - ID bài viết
     * @param {number} reactionIndex - Index của reaction
     * @returns {boolean} True nếu thành công
     */
    async function reactToPost(postId, reactionIndex) {
        try {
            if (reactionIndex < 0 || reactionIndex >= CONFIG.REACTIONS.length) {
                console.log('Invalid reaction index:', reactionIndex);
                return false;
            }

            const reaction = CONFIG.REACTIONS[reactionIndex];
            console.log(`Reacting to post ${postId} with ${reaction}`);

            // Lấy reaction picker
            const url = `${CONFIG.MBASIC_URL}/reactions/picker/?ft_id=${postId}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();

            // Kiểm tra xem đã reaction chưa
            if (html.includes('<span class="z">')) {
                console.log('Already reacted to this post');
                return false;
            }

            // Tìm link reaction
            const reactionLinks = html.match(/<a href="\/ufi\/reaction\/\?ft_ent_identifier=[^"]*"/g);
            if (!reactionLinks || reactionLinks.length <= reactionIndex) {
                console.log('Reaction link not found');
                return false;
            }

            const reactionLink = reactionLinks[reactionIndex]
                .replace('<a href="', '')
                .replace('"', '')
                .replace(/&amp;/g, '&');

            // Thực hiện reaction
            const reactResponse = await fetch(`${CONFIG.MBASIC_URL}${reactionLink}`, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive'
                }
            });

            const success = reactResponse.ok;
            console.log(`Reaction result: ${success}`);
            return success;

        } catch (error) {
            console.error('Error reacting to post:', error);
            return false;
        }
    }

    // ==================== MAIN AUTO REACTION FUNCTION ====================

    /**
     * Hàm chính thực hiện auto reaction với SAFETY CHECKS
     */
    async function performAutoReaction() {
        if (isRunning) {
            console.log('Auto reaction already running, skipping...');
            return;
        }

        console.log('=== FB Smart Engagement Pro - Starting Auto Reaction ===');
        console.log('Current time:', new Date().toLocaleString());
        console.log('Safety check result:', await isSafeToOperate());

        // SAFETY CHECK - Kiểm tra an toàn trước khi bắt đầu
        if (!(await isSafeToOperate())) {
            console.log('Safety check failed - pausing auto reaction');
            return;
        }

        isRunning = true;
        console.log('Starting auto reaction with safety features...');

        try {
            // Lấy cài đặt
            const settings = await getSettings();
            console.log('Settings loaded:', settings);

            // Kiểm tra xác thực
            if (!await getFacebookAuth()) {
                console.log('Facebook authentication failed');
                return;
            }

            // Lấy danh sách bài viết
            const posts = await getNewsFeedPosts();
            if (posts.length === 0) {
                console.log('No posts found');
                return;
            }

            // Xử lý từng bài viết với SAFETY CHECKS
            for (const post of posts) {
                if (!isRunning) {
                    console.log('Auto reaction stopped');
                    break;
                }

                // SAFETY CHECK - Kiểm tra an toàn cho mỗi bài viết
                if (!(await isSafeToOperate())) {
                    console.log('Safety limit reached - stopping auto reaction');
                    break;
                }

                const postKey = `${post.ownerId}_${post.postId}`;

                // Bỏ qua nếu đã xử lý
                if (processedPosts.has(postKey)) {
                    console.log(`Skipping already processed post: ${postKey}`);
                    continue;
                }

                // HUMAN BEHAVIOR SIMULATION - Mô phỏng hành vi người dùng
                if (!await simulateHumanBehavior()) {
                    console.log('Human behavior simulation - skipping post');
                    continue;
                }

                // Bỏ qua fanpage nếu cài đặt
                if (settings.ignore_fp && post.pageId) {
                    console.log(`Skipping fanpage post: ${postKey}`);
                    continue;
                }

                // Bỏ qua nhóm nếu cài đặt
                if (settings.ignore_gr && post.groupId) {
                    console.log(`Skipping group post: ${postKey}`);
                    continue;
                }

                // Bỏ qua blacklist
                if (settings.blacklist && settings.blacklist.includes(post.ownerId)) {
                    console.log(`Skipping blacklisted user: ${post.ownerId}`);
                    continue;
                }

                console.log(`Processing post: ${postKey}`);

                // Lấy số lượng reaction
                const counts = await getReactionCounts(post.postId);
                if (!counts) {
                    await delay(CONFIG.DELAY_BETWEEN_POSTS);
                    continue;
                }

                // Chọn reaction
                const reactionIndex = chooseReaction(counts);
                if (reactionIndex >= 0) {
                    // Thực hiện reaction với SAFETY TRACKING
                    const success = await reactToPost(post.postId, reactionIndex);
                    if (success) {
                        console.log(`Successfully reacted to post ${post.postId} with ${CONFIG.REACTIONS[reactionIndex]}`);
                        processedPosts.add(postKey);

                        // CẬP NHẬT ACTIVITY TRACKER - Theo dõi hoạt động
                        updateActivityTracker();
                        console.log(`Activity: ${activityTracker.reactionsToday}/${CONFIG.MAX_REACTIONS_PER_DAY} today, ${activityTracker.reactionsThisHour}/${CONFIG.MAX_REACTIONS_PER_HOUR} this hour`);
                    }
                }

                // Delay giữa các bài viết
                await delay(CONFIG.DELAY_BETWEEN_POSTS);
            }

        } catch (error) {
            console.error('Error in auto reaction:', error);
        } finally {
            isRunning = false;

            // RESET SESSION nếu đã hết thời gian
            if (activityTracker.sessionStart) {
                const sessionDuration = Date.now() - activityTracker.sessionStart;
                if (sessionDuration > CONFIG.MAX_SESSION_DURATION) {
                    console.log('Session duration exceeded - resetting session');
                    resetSession();
                }
            }

            console.log('Auto reaction completed with safety features');
        }
    }

    // ==================== SAFETY FUNCTIONS ====================

    /**
     * Kiểm tra xem có thể hoạt động an toàn không
     * @returns {boolean} True nếu an toàn
     */
    async function isSafeToOperate() {
        const now = new Date();
        const settings = await getSettings();

        // Kiểm tra giờ làm việc
        if (settings.working_hours_only) {
            const hour = now.getHours();
            if (hour < 9 || hour > 18) {
                console.log('Outside working hours - pausing activity');
                return false;
            }
        }

        // Kiểm tra ngày trong tuần
        if (settings.weekdays_only) {
            const day = now.getDay();
            if (day === 0 || day === 6) { // Sunday or Saturday
                console.log('Weekend - pausing activity');
                return false;
            }
        }

        // Kiểm tra giới hạn reactions
        if (activityTracker.reactionsToday >= settings.max_reactions_day) {
            console.log('Daily reaction limit reached');
            return false;
        }

        if (activityTracker.reactionsThisHour >= settings.max_reactions_hour) {
            console.log('Hourly reaction limit reached');
            return false;
        }

        // Kiểm tra session duration
        if (activityTracker.sessionStart) {
            const sessionDuration = Date.now() - activityTracker.sessionStart;
            if (sessionDuration > CONFIG.MAX_SESSION_DURATION) {
                console.log('Session duration limit reached');
                return false;
            }
        }

        return true;
    }

    /**
     * Cập nhật activity tracker
     */
    function updateActivityTracker() {
        const now = new Date();
        const today = now.toDateString();

        // Reset daily counter nếu ngày mới
        if (today !== activityTracker.dailyReset) {
            activityTracker.reactionsToday = 0;
            activityTracker.dailyReset = today;
        }

        // Reset hourly counter nếu giờ mới
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        if (!activityTracker.lastActivity || activityTracker.lastActivity < oneHourAgo) {
            activityTracker.reactionsThisHour = 0;
        }

        // Cập nhật counters
        activityTracker.reactionsToday++;
        activityTracker.reactionsThisHour++;
        activityTracker.lastActivity = Date.now();

        // Bắt đầu session nếu chưa có
        if (!activityTracker.sessionStart) {
            activityTracker.sessionStart = Date.now();
        }
    }

    /**
     * Reset session sau khi nghỉ
     */
    function resetSession() {
        activityTracker.sessionStart = null;
        console.log('Session reset - ready for new session');
    }

    /**
     * Lấy random delay để tránh pattern detection
     * @param {number} baseDelay - Delay cơ bản
     * @returns {number} Random delay
     */
    function getRandomDelay(baseDelay) {
        const randomFactor = 0.7 + Math.random() * 0.6; // 0.7x to 1.3x
        return Math.floor(baseDelay * randomFactor);
    }

    /**
     * Mô phỏng hành vi người dùng
     */
    async function simulateHumanBehavior() {
        // Random pause giữa các hoạt động
        if (Math.random() < 0.1) { // 10% chance
            const pauseTime = 10000 + Math.random() * 20000; // 10-30 seconds
            console.log(`Human behavior simulation - pausing for ${pauseTime / 1000}s`);
            await delay(pauseTime);
        }

        // Random skip posts
        if (Math.random() < 0.15) { // 15% chance
            console.log('Human behavior simulation - skipping post');
            return false;
        }

        return true;
    }

    // ==================== UTILITY FUNCTIONS ====================

    /**
     * Delay function với random factor
     * @param {number} ms - Milliseconds to delay
     */
    function delay(ms) {
        const randomMs = getRandomDelay(ms);
        return new Promise(resolve => setTimeout(resolve, randomMs));
    }

    // ==================== EVENT LISTENERS ====================

    /**
     * Xử lý alarm (chu kỳ chạy)
     */
    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === 'autoReaction') {
            console.log('Alarm triggered - starting auto reaction');
            performAutoReaction();
        }
    });

    /**
     * Xử lý message từ popup
     */
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('Message received:', request);

        if (request.action === 'start') {
            // Bắt đầu auto reaction
            chrome.alarms.clear('autoReaction');
            const timePeriod = request.timePeriod || 5;
            chrome.alarms.create('autoReaction', {
                delayInMinutes: 1,
                periodInMinutes: timePeriod
            });
            console.log(`Auto reaction started with ${timePeriod} minute interval`);
            sendResponse({ success: true });

        } else if (request.action === 'stop') {
            // Dừng auto reaction
            chrome.alarms.clear('autoReaction');
            isRunning = false;
            console.log('Auto reaction stopped');
            sendResponse({ success: true });

        } else if (request.action === 'status') {
            // Lấy trạng thái
            chrome.alarms.get('autoReaction').then(alarm => {
                sendResponse({
                    running: !!alarm,
                    isProcessing: isRunning
                });
            });
            return true; // Giữ message channel mở cho async response
        }
    });

    // ==================== AUTO-START ====================

    /**
     * Tự động khởi động nếu cài đặt
     */
    getSettings().then(settings => {
        if (settings.startup) {
            console.log('Auto-starting extension...');
            chrome.alarms.create('autoReaction', {
                delayInMinutes: 1,
                periodInMinutes: settings.time_period
            });
        }
    });

    console.log('Smart Auto Reaction for FB background script loaded');

    // ==================== TRIAL & SUBSCRIPTION FUNCTIONS ====================

    /**
     * Khởi tạo hệ thống trial
     */
    async function initializeTrialSystem() {
        try {
            const result = await chrome.storage.local.get(['userStatus']);

            if (!result.userStatus) {
                // First time user - start trial
                userStatus = {
                    isTrial: true,
                    trialStart: Date.now(),
                    isPro: false,
                    licenseKey: null,
                    expires: null,
                    plan: 'trial'
                };

                await chrome.storage.local.set({ userStatus });
                console.log('Trial started for new user');
            } else {
                userStatus = result.userStatus;
                await checkTrialStatus();
            }
        } catch (error) {
            console.error('Error initializing trial system:', error);
        }
    }

    /**
     * Kiểm tra trạng thái trial
     */
    async function checkTrialStatus() {
        const now = Date.now();
        const trialDuration = CONFIG.TRIAL_DAYS * 24 * 60 * 60 * 1000; // 3 days in ms

        if (userStatus.isTrial && userStatus.trialStart) {
            const trialEnd = userStatus.trialStart + trialDuration;

            if (now > trialEnd) {
                // Trial expired
                userStatus.isTrial = false;
                userStatus.isPro = false;
                userStatus.plan = 'free';

                await chrome.storage.local.set({ userStatus });
                console.log('Trial expired - user needs to upgrade');

                // Notify popup about trial expiration
                chrome.runtime.sendMessage({
                    type: 'TRIAL_EXPIRED'
                });
            }
        }
    }

    /**
     * Kiểm tra quyền sử dụng tính năng
     */
    function canUseFeature(feature) {
        if (userStatus.isPro && userStatus.licenseKey) {
            return true; // PRO users have all features
        }

        if (userStatus.isTrial) {
            return true; // Trial users have all features
        }

        // FREE users have limited features
        const freeFeatures = ['basic_reactions', 'basic_settings'];
        return freeFeatures.includes(feature);
    }

    /**
     * Kiểm tra giới hạn reactions
     */
    function getReactionLimits() {
        if (userStatus.isPro) {
            return {
                perHour: CONFIG.PRO_REACTIONS_PER_HOUR,
                perDay: CONFIG.PRO_REACTIONS_PER_DAY
            };
        }

        if (userStatus.isTrial) {
            return {
                perHour: CONFIG.MAX_REACTIONS_PER_HOUR,
                perDay: CONFIG.MAX_REACTIONS_PER_DAY
            };
        }

        // FREE users
        return {
            perHour: 5,
            perDay: CONFIG.FREE_REACTIONS_PER_DAY
        };
    }

    /**
     * Kích hoạt PRO license
     */
    async function activateProLicense(licenseKey, plan, expires) {
        userStatus.isPro = true;
        userStatus.isTrial = false;
        userStatus.licenseKey = licenseKey;
        userStatus.expires = expires;
        userStatus.plan = plan;

        await chrome.storage.local.set({ userStatus });
        console.log('PRO license activated:', licenseKey);

        // Notify popup about PRO activation
        chrome.runtime.sendMessage({
            type: 'PRO_ACTIVATED',
            plan: plan
        });
    }

    /**
     * Validate license với server
     */
    async function validateLicense() {
        if (!userStatus.licenseKey) {
            return false;
        }

        try {
            const response = await fetch('https://fb-smart-engagement-api.vercel.app/api/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    licenseKey: userStatus.licenseKey,
                    userId: userID,
                    deviceId: await getDeviceId()
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.valid && data.expires > Date.now();
            }
        } catch (error) {
            console.error('License validation failed:', error);
        }

        return false;
    }

    /**
     * Lấy device ID
     */
    async function getDeviceId() {
        const result = await chrome.storage.local.get(['deviceId']);
        if (!result.deviceId) {
            const deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            await chrome.storage.local.set({ deviceId });
            return deviceId;
        }
        return result.deviceId;
    }

    /**
     * Mở trang thanh toán
     */
    function openPaymentPage() {
        chrome.tabs.create({
            url: 'https://fb-smart-engagement-api.vercel.app/?userId=' + userID
        });
    }

    // ==================== MESSAGE HANDLERS ====================

    // Handle messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'GET_USER_STATUS') {
            sendResponse(userStatus);
        } else if (request.type === 'OPEN_PAYMENT') {
            openPaymentPage();
        } else if (request.type === 'ACTIVATE_LICENSE') {
            activateProLicense(request.licenseKey, request.plan, request.expires);
        }
    });

})();