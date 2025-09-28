# API Key Setup Instructions

## For Local Development

1. Create a `.env` file in the project root:
```bash
echo "CLAUDE_API_KEY=your_actual_api_key_here" > .env
```

2. Replace `your_actual_api_key_here` with your actual Claude API key

3. The Node.js server will automatically use this key

## For GitHub Pages

The API key is included in the client-side code (`js/config-unified.js`) because GitHub Pages only serves static files. This is necessary for the demo to work.

### Security Considerations for Public Demo

- The API key will be visible in the browser
- Use a separate API key specifically for this public demo
- Monitor usage in your Anthropic dashboard
- Consider implementing rate limiting
- For production, use a backend service to hide the API key

### Rate Limiting Recommendations

- Set up usage alerts in Anthropic dashboard
- Consider implementing client-side rate limiting
- Monitor for unusual usage patterns
