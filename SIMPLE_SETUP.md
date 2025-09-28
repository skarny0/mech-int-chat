# Simple GitHub Pages Setup (No Node.js Required)

## 🚀 Quick Setup

1. **Add your API key**:
   - Edit `js/config-unified.js`
   - Replace `YOUR_API_KEY_HERE` with your actual Claude API key

2. **Deploy to GitHub Pages**:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Select "Deploy from a branch" → "main" → "/ (root)"
   - Click Save

## 🔧 How It Works

- **Pure static files** - no server required
- **CORS proxy** - handles API calls through public proxy services
- **Fallback system** - tries multiple proxies if one fails
- **GitHub Pages compatible** - works immediately after deployment

## 📝 Files Structure

```
your-repository/
├── index.html                    # Main page
├── html/
│   └── chat-content.html         # Chat interface
├── js/
│   ├── config-unified.js         # API configuration
│   └── chat.js                   # Chat functionality
├── css/
│   └── consent.css
└── images/
    └── ml_logo.png
```

## 🔒 Security Note

- API key is visible in the browser (necessary for static hosting)
- Use a separate API key for this demo
- Monitor usage in your Anthropic dashboard
- Consider rate limiting for production use

## 🧪 Testing

1. **Local testing**: Open `index.html` in a browser
2. **GitHub Pages**: Visit `https://yourusername.github.io/your-repository-name`

That's it! No Node.js, no servers, just pure static files that work on GitHub Pages.
