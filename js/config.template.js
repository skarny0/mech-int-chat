// API Configuration Template
// Copy this file to config.js and add your actual API key
// DO NOT commit config.js to version control

const API_CONFIG = {
    // Claude API Configuration
    endpoint: 'https://api.anthropic.com/v1/messages',
    apiKey: 'YOUR_CLAUDE_API_KEY_HERE', // Replace with your actual API key
    model: 'claude-3-sonnet-20240229',
    maxTokens: 1000
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
