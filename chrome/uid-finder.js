/**
 * Facebook Smart Engagement Pro - Find UID Tool
 * Advanced UID Detection System
 * 
 * Chức năng:
 * - Smart UID detection
 * - Multiple URL format support
 * - Advanced parsing algorithms
 * - Safety validation
 */

document.addEventListener("DOMContentLoaded", function () {
    'use strict';

    // ==================== INITIALIZATION ====================

    /**
     * Khởi tạo find UID page
     */
    function initFindUID() {
        console.log('Initializing Find UID page...');
        setupEventListeners();
        console.log('Find UID page initialized');
    }

    // ==================== EVENT LISTENERS ====================

    /**
     * Thiết lập event listeners
     */
    function setupEventListeners() {
        // Find UID button click
        document.querySelector(".btn.find-id").addEventListener("click", handleFindUID);

        // Enter key support for URL input
        document.getElementById("url").addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                handleFindUID();
            }
        });

        // Clear UID display when URL changes
        document.getElementById("url").addEventListener("input", function () {
            const uidDisplay = document.querySelector(".uid");
            if (uidDisplay && uidDisplay.textContent !== "ID: ") {
                uidDisplay.textContent = "";
                uidDisplay.style.color = "";
            }
        });
    }

    // ==================== MAIN FUNCTION ====================

    /**
     * Xử lý tìm UID
     */
    async function handleFindUID() {
        const urlInput = document.getElementById("url");
        const uidDisplay = document.querySelector(".uid");

        if (!urlInput || !uidDisplay) {
            console.error('Required elements not found');
            return;
        }

        let url = urlInput.value.trim();

        // Validate input
        if (!url) {
            showResult(uidDisplay, "Vui lòng nhập URL Facebook", "error");
            return;
        }

        // Convert URL to mobile format for better parsing
        url = convertToMobileURL(url);

        try {
            showResult(uidDisplay, "Đang tải...", "loading");

            // Try multiple methods to get UID
            let uid = null;

            // Method 1: Try Graph API for username
            if (url.includes('/') && !url.includes('profile.php')) {
                const username = extractUsernameFromURL(url);
                if (username) {
                    uid = await tryGraphAPI(username);
                    if (uid) {
                        showResult(uidDisplay, `ID: ${uid}`, "success");
                        console.log('UID found via Graph API:', uid);
                        return;
                    }
                }
            }

            // Method 2: Try mobile Facebook page
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
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

            // Try multiple methods to extract UID
            uid = extractUID(html);

            if (uid) {
                showResult(uidDisplay, `ID: ${uid}`, "success");
                console.log('UID found:', uid);
            } else {
                showResult(uidDisplay, "Không tìm thấy UID. Vui lòng kiểm tra URL hoặc thử profile khác.", "error");
                console.log('UID not found');
            }

        } catch (error) {
            console.error('Error finding UID:', error);
            showResult(uidDisplay, `Lỗi: ${error.message}`, "error");
        }
    }

    // ==================== UTILITY FUNCTIONS ====================

    /**
     * Trích xuất username từ URL
     * @param {string} url - Facebook URL
     * @returns {string|null} Username hoặc null
     */
    function extractUsernameFromURL(url) {
        // Extract username from various Facebook URL formats
        const patterns = [
            /facebook\.com\/([^\/\?]+)/i,
            /m\.facebook\.com\/([^\/\?]+)/i,
            /www\.facebook\.com\/([^\/\?]+)/i
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1] && match[1] !== 'profile.php' && match[1] !== 'pages' && match[1] !== 'groups') {
                return match[1];
            }
        }
        return null;
    }

    /**
     * Thử Graph API để lấy UID từ username
     * @param {string} username - Facebook username
     * @returns {string|null} UID hoặc null
     */
    async function tryGraphAPI(username) {
        try {
            // Try public Graph API endpoint
            const response = await fetch(`https://graph.facebook.com/${username}?fields=id`, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.id) {
                    return data.id;
                }
            }
        } catch (error) {
            console.log('Graph API failed:', error.message);
        }

        // Try alternative method with mobile Facebook
        try {
            const mobileUrl = `https://m.facebook.com/${username}`;
            const response = await fetch(mobileUrl, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
                }
            });

            if (response.ok) {
                const html = await response.text();
                return extractUID(html);
            }
        } catch (error) {
            console.log('Mobile Facebook method failed:', error.message);
        }

        return null;
    }

    /**
     * Chuyển đổi URL sang định dạng mobile
     * @param {string} url - URL gốc
     * @returns {string} URL mobile
     */
    function convertToMobileURL(url) {
        // Convert to mobile format for better parsing
        if (url.includes("www")) {
            url = url.replace("www", "m");
        }
        if (url.includes("mbasic")) {
            url = url.replace("mbasic", "m");
        }
        if (url.includes("//facebook")) {
            url = url.replace("//facebook", "//m.facebook");
        }

        return url;
    }

    /**
     * Trích xuất UID từ HTML
     * @param {string} html - HTML content
     * @returns {string|null} UID hoặc null
     */
    function extractUID(html) {
        let uid = null;

        // Method 1: Look for entity_id in the HTML
        const entityIdMatch = html.match(/entity_id[:\s]*(\d+)/i);
        if (entityIdMatch) {
            uid = entityIdMatch[1];
            console.log('UID found via entity_id method');
            return uid;
        }

        // Method 2: Look for profile ID in data attributes
        const profileIdMatch = html.match(/data-profileid[:\s]*["']?(\d+)["']?/i);
        if (profileIdMatch) {
            uid = profileIdMatch[1];
            console.log('UID found via data-profileid method');
            return uid;
        }

        // Method 3: Look for user ID in script tags
        const scriptMatches = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi);
        if (scriptMatches) {
            for (const script of scriptMatches) {
                const uidMatch = script.match(/["']user_id["']\s*:\s*["']?(\d+)["']?/i);
                if (uidMatch) {
                    uid = uidMatch[1];
                    console.log('UID found via script method');
                    return uid;
                }
            }
        }

        // Method 4: Look for profile URL patterns
        const profileUrlMatch = html.match(/\/profile\.php\?id=(\d+)/i);
        if (profileUrlMatch) {
            uid = profileUrlMatch[1];
            console.log('UID found via profile URL method');
            return uid;
        }

        // Method 5: Look for UID in meta tags
        const metaMatches = html.match(/<meta[^>]*content[^>]*>/gi);
        if (metaMatches) {
            for (const meta of metaMatches) {
                const uidMatch = meta.match(/content[^>]*(\d{10,})/i);
                if (uidMatch) {
                    uid = uidMatch[1];
                    console.log('UID found via meta method');
                    return uid;
                }
            }
        }

        // Method 6: Look for UID in JSON data
        const jsonMatches = html.match(/\{[^}]*"user_id"[^}]*\}/gi);
        if (jsonMatches) {
            for (const jsonStr of jsonMatches) {
                try {
                    const jsonData = JSON.parse(jsonStr);
                    if (jsonData.user_id) {
                        uid = jsonData.user_id.toString();
                        console.log('UID found via JSON method');
                        return uid;
                    }
                } catch (e) {
                    // Continue to next match
                }
            }
        }

        console.log('UID not found with any method');
        return null;
    }

    /**
     * Hiển thị kết quả với màu sắc phù hợp
     * @param {HTMLElement} element - Element để hiển thị
     * @param {string} message - Message
     * @param {string} type - Type: success, error, loading
     */
    function showResult(element, message, type) {
        element.textContent = message;

        switch (type) {
            case 'success':
                element.style.color = "#28a745"; // Green
                break;
            case 'error':
                element.style.color = "#dc3545"; // Red
                break;
            case 'loading':
                element.style.color = "#007bff"; // Blue
                break;
            default:
                element.style.color = "";
        }
    }

    // ==================== INITIALIZATION ====================

    // Khởi tạo page
    initFindUID();

    console.log('Find Facebook UID script loaded');
});