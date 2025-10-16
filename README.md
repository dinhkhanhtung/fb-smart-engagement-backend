# Smart Auto Reaction for FB - Chrome & Firefox Versions

## 📁 Project Structure

```
Smart Auto Reaction for FB/
├── chrome/           # Chrome extension version
│   ├── manifest.json
│   ├── background.js
│   ├── popup.html
│   ├── popup.js
│   ├── style.css
│   ├── facebook-uid-finder.html
│   ├── uid-finder.js
│   └── polyfill.js
│
├── firefox/          # Firefox extension version
│   ├── manifest.json
│   ├── background.js
│   ├── popup.html
│   ├── popup.js
│   ├── style.css
│   ├── facebook-uid-finder.html
│   ├── uid-finder.js
│   └── polyfill.js
│
└── README.md
```

## 🌐 Browser Compatibility

### Chrome Version (`chrome/`)
- **Target**: Google Chrome, Chromium-based browsers
- **Manifest**: V3 (compatible with Chrome's latest requirements)
- **APIs**: Uses `chrome.*` namespace
- **Features**: Full compatibility with Chrome extension APIs

### Firefox Version (`firefox/`)
- **Target**: Mozilla Firefox
- **Manifest**: V3 with Firefox-specific settings
- **APIs**: Uses `browser.*` namespace for compatibility
- **Features**:
  - Firefox-specific manifest settings (`browser_specific_settings`)
  - Compatible cookie handling
  - Cross-browser storage APIs

## 🚀 Installation Guide

### Chrome Installation
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome/` folder
5. Extension is now installed!

### Firefox Installation
1. Open Firefox and go to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on..."
4. Navigate to the `firefox/` folder and select `manifest.json`
5. Extension is now installed!

## ⚡ Features

### Core Functionality
- **Smart Auto Reactions**: Intelligent reaction selection based on post engagement
- **Safety Features**: Built-in limits and monitoring to avoid detection
- **Human Behavior Simulation**: Randomized delays and patterns
- **Activity Tracking**: Monitor reactions per hour/day
- **Trial System**: 3-day free trial with PRO upgrade path

### Advanced Features
- **Multiple Account Support**: Handle different Facebook accounts
- **Blacklist System**: Exclude specific users/pages
- **Customizable Settings**: Extensive configuration options
- **UID Finder Tool**: Extract Facebook user IDs from profiles
- **Real-time Monitoring**: Live activity tracking

## 🔧 Configuration

Both versions support identical configuration options:

### Basic Settings
- **Auto Startup**: Launch extension when browser starts
- **Ignore Fanpages**: Skip posts from Facebook pages
- **Ignore Groups**: Skip posts from Facebook groups
- **Time Period**: Check interval for new posts (minutes)

### Safety Settings
- **Working Hours Only**: Restrict activity to 9 AM - 6 PM
- **Weekdays Only**: Disable on weekends
- **Max Reactions/Hour**: Hourly reaction limit
- **Max Reactions/Day**: Daily reaction limit
- **Delay Between Reactions**: Pause between reactions (seconds)

## 📋 Usage Instructions

1. **Install** the appropriate version for your browser
2. **Open Facebook** in a new tab
3. **Click** the extension icon in your browser toolbar
4. **Configure** settings as needed
5. **Click "Kích hoạt"** to start auto reactions
6. **Monitor** activity in the popup interface

## 🔒 Safety Guidelines

- Keep at least one Facebook tab open for stability
- Start with conservative settings (lower limits)
- Monitor your Facebook activity regularly
- Use the blacklist feature for unwanted content
- Consider enabling working hours restriction

## 🛠️ Development

### Key Differences Between Versions

#### Manifest Files
- **Chrome**: Standard Manifest V3
- **Firefox**: Manifest V3 + `browser_specific_settings.gecko` section

#### JavaScript APIs
- **Chrome**: `chrome.storage`, `chrome.alarms`, `chrome.tabs`
- **Firefox**: `browser.storage`, `browser.alarms`, `browser.tabs`

#### Cookie Handling
- **Chrome**: Direct cookie access via `chrome.cookies`
- **Firefox**: Requires `host_permissions` for cookie access

## 📝 Version History

- **v1.0.0**: Initial release with Chrome & Firefox support
- **Features**: Smart reactions, safety limits, trial system
- **Compatibility**: Chrome 88+, Firefox 85+

## 🆘 Troubleshooting

### Common Issues

**Extension not working:**
- Ensure Facebook tab is open
- Check if cookies are enabled for facebook.com
- Verify extension permissions

**Reactions not posting:**
- Check rate limits in settings
- Ensure valid Facebook session
- Try refreshing Facebook page

**Settings not saving:**
- Check browser storage permissions
- Try restarting the extension

## 📞 Support

For support and updates, visit:
- Facebook: https://www.facebook.com/dinhkhanhtung
- Repository: [GitHub Link]

---

**Note**: This extension is designed for educational and research purposes. Use responsibly and in accordance with Facebook's Terms of Service.
