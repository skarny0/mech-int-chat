// Unified Configuration for Local Development and Vercel Deployment
// Automatically detects environment and uses appropriate API configuration

// Claude API Configuration (uncomment to use Claude)
// const API_CONFIG = {
//     model: 'claude-3-5-sonnet-20241022',
//     maxTokens: 1000,
//     apiEndpoint: '/api/claude'
// };

// Modal AI Configuration (uncomment to use Modal, comment out Claude config above)
const API_CONFIG = {
    model: 'gemma-2-2b-it', // Gemma 2B model from your friend's Modal deployment
    maxTokens: 1000,
    apiEndpoint: '/api/modal'
};

// Function to make API request using Vercel serverless function or CORS proxy fallback
async function makeAPIRequest(requestData) {
    // Check if we're running on Vercel (production) or locally
    const isVercel = window.location.hostname.includes('vercel.app') || 
                     window.location.hostname.includes('vercel.com') ||
                     window.location.hostname.includes('vercel') ||
                     window.location.hostname === 'localhost' && window.location.port === '3000';
    
    console.log('API Request:', {
        hostname: window.location.hostname,
        isVercel: isVercel,
        apiEndpoint: API_CONFIG.apiEndpoint
    });
    
    if (isVercel) {
        // Use Vercel serverless function (no API key needed on frontend)
        try {
            const response = await fetch(API_CONFIG.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                return await response.json();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || `API request failed with status: ${response.status}`);
            }
        } catch (error) {
            console.error('API error:', error);
            throw error;
        }
    } else {
        // Local development - use direct API calls
        try {
            const response = await fetch(config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                return await response.json();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || `API request failed with status: ${response.status}`);
            }
        } catch (error) {
            console.error('Local API error:', error);
            throw error;
        }
    }
}


// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        API_CONFIG, 
        makeAPIRequest 
    };
}