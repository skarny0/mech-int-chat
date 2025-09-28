# MIT Media Lab Chat Study - Setup Instructions

## Quick Start (Recommended)

### Option 1: Using the Proxy Server (Real Claude API)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the project root:
   ```
   CLAUDE_API_KEY=your_actual_api_key_here
   PORT=3000
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open the application:**
   - Go to `http://localhost:3000`
   - Complete the consent form
   - Start chatting with Claude!

### Option 2: Fallback Mode (No API)

If you don't want to set up the API, the chat will work with intelligent fallback responses:

1. **Open `index.html` directly in your browser**
2. **Complete the consent form**
3. **Start chatting** - you'll get contextual responses based on your messages

## API Configuration (Advanced)

### 1. Get your Claude API Key
- Visit [Anthropic Console](https://console.anthropic.com/)
- Create an account and generate an API key

### 2. Configure the API
- Copy `js/config.template.js` to `js/config.js`
- Replace `YOUR_CLAUDE_API_KEY_HERE` with your actual API key

```bash
cp js/config.template.js js/config.js
# Then edit js/config.js with your actual API key
```

### 3. Security Notes
- **Never commit `js/config.js` to version control**
- The `.gitignore` file is configured to exclude `js/config.js`
- The proxy server uses environment variables for security

### 4. Test the Integration
- Start the server: `npm start`
- Open `http://localhost:3000`
- Complete the consent form
- Try sending a message in the chat interface
- You should receive real responses from Claude

## File Structure
```
├── js/
│   ├── config.js          # Your API configuration (DO NOT COMMIT)
│   ├── config.template.js # Template for API configuration
│   └── chat.js           # Chat interface logic
├── html/
│   ├── consent.html      # Consent form
│   └── chat-content.html # Chat interface
└── index.html           # Main application
```

## Troubleshooting
- Check browser console for API errors
- Verify your API key is correct
- Ensure you have sufficient API credits
- Check network connectivity
