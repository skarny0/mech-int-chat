// Unified Configuration for Local Development and Vercel Deployment
// Automatically detects environment and uses appropriate API configuration

// Configuration for Vercel serverless deployment
const API_CONFIG = {
    // Claude API Configuration
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 1000,
    
    // Vercel API endpoint (serverless function)
    apiEndpoint: '/api/claude'
};

// Function to make API request using Vercel serverless function or CORS proxy fallback
async function makeAPIRequest(requestData) {
    // Check if we're running on Vercel (production) or locally
    const isVercel = window.location.hostname.includes('vercel.app') || 
                     window.location.hostname.includes('vercel.com') ||
                     window.location.hostname.includes('vercel') ||
                     window.location.hostname === 'localhost' && window.location.port === '3000';
    
    console.log('Vercel detection:', {
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
            console.error('Vercel API error:', error);
            throw error;
        }
    } else {
        // This should not happen in production - Vercel detection should work
        throw new Error('Unable to determine deployment environment. Please ensure you are using Vercel deployment.');
    }
}


// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, getAPIUrl, makeAPIRequest };
}