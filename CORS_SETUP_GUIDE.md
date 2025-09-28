# CORS Setup Guide for GitHub Pages Deployment

## Overview
This guide explains how to deploy your LLM agent using GitHub Pages with public CORS proxies to bypass CORS restrictions.

## What Was Fixed

### 1. CORS Header Issues
- **Problem**: `api.allorigins.win` doesn't allow the `anthropic-version` header in preflight requests
- **Solution**: Switched to `corsproxy.io` which supports custom headers

### 2. Proxy Service Failures
- **Problem**: Multiple proxy services were failing (403 Forbidden, SSL issues, redirects)
- **Solution**: Updated proxy list with more reliable services and better error handling

### 3. API Key Security
- **Problem**: API keys were hardcoded in the configuration
- **Solution**: Implemented secure client-side API key storage with user input

## How to Use

### 1. Get Your Anthropic API Key
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-...`)

### 2. Set Up Your API Key
1. Open your deployed GitHub Pages site
2. Click the settings button (gear icon) in the top-right corner
3. Enter your Anthropic API key in the modal
4. Click "Save API Key"
5. The key is stored locally in your browser

### 3. Test the Setup
1. Open `test-cors-proxy.html` in your browser
2. Enter your API key
3. Click "Test CORS Proxy" to verify the connection works
4. If successful, you should see a response from Claude

## Configuration Details

### Primary CORS Proxy
- **Service**: `corsproxy.io`
- **URL**: `https://corsproxy.io/?`
- **Features**: Supports custom headers, reliable uptime

### Fallback Proxies
1. `https://api.codetabs.com/v1/proxy?quest=`
2. `https://cors-anywhere.herokuapp.com/`
3. `https://thingproxy.freeboard.io/fetch/`

### API Key Storage
- **Method**: localStorage (client-side only)
- **Security**: Never sent to your servers
- **Persistence**: Stored in user's browser

## Troubleshooting

### Common Issues

1. **"API key not found" error**
   - Solution: Click settings button and enter your API key

2. **CORS errors still occurring**
   - Solution: Try the test page to see which proxies work
   - The system will automatically try fallback proxies

3. **All proxies failing**
   - Solution: Check your internet connection
   - Some proxies may be temporarily down
   - Try again later

### Testing Your Setup

Use the included `test-cors-proxy.html` file to:
- Test individual proxies
- Verify API key functionality
- Debug connection issues

## Security Notes

- API keys are stored locally in the user's browser
- Keys are never transmitted to your GitHub Pages site
- Each user must enter their own API key
- Keys are not shared between users

## Deployment Steps

1. Push your changes to GitHub
2. Enable GitHub Pages in repository settings
3. Select source branch (usually `main`)
4. Your site will be available at `https://yourusername.github.io/repository-name`
5. Users can then access the site and enter their API keys

## File Structure

```
├── index.html                 # Main page
├── html/chat-content.html     # Chat interface
├── js/
│   ├── config-unified.js      # API configuration
│   └── chat.js               # Chat functionality
├── test-cors-proxy.html      # Testing utility
└── CORS_SETUP_GUIDE.md       # This guide
```

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Use the test page to verify proxy functionality
3. Ensure your API key is valid and has sufficient credits
4. Try different browsers or clear browser cache
