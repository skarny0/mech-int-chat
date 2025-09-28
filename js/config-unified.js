// Unified Configuration for Local Development and Vercel Deployment
// Automatically detects environment and uses appropriate API configuration

// Configuration for Vercel serverless deployment
const API_CONFIG = {
    // Claude API Configuration
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 1000,
    
    // Vercel API endpoint (serverless function)
    apiEndpoint: '/api/claude',
    
    // Fallback to CORS proxies for local development
    corsProxy: 'https://api.allorigins.win/raw?url=',
    fallbackProxies: [
        'https://cors-anywhere.herokuapp.com/',
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://thingproxy.freeboard.io/fetch/'
    ]
};

// Function to make API request using Vercel serverless function or CORS proxy fallback
async function makeAPIRequest(requestData) {
    // Check if we're running on Vercel (production) or locally
    const isVercel = window.location.hostname.includes('vercel.app') || 
                     window.location.hostname.includes('vercel.com') ||
                     window.location.hostname === 'localhost' && window.location.port === '3000';
    
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
        // Fallback to CORS proxies for local development
        const apiKey = getAPIKey();
        if (!apiKey) {
            throw new Error('API key not found. Please set your Anthropic API key for local development.');
        }

        // Try primary CORS proxy first (allorigins.win - no custom headers)
        try {
            const proxyUrl = API_CONFIG.corsProxy;
            const fullUrl = proxyUrl + encodeURIComponent('https://api.anthropic.com/v1/messages');
            
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                    // Note: allorigins.win doesn't support anthropic-version header
                },
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                return await response.json();
            } else {
                console.warn(`Primary proxy failed with status: ${response.status}`);
            }
        } catch (error) {
            console.warn('Primary proxy error:', error.message);
        }

        // Try fallback proxies (with custom headers)
        for (let i = 0; i < API_CONFIG.fallbackProxies.length; i++) {
            try {
                const proxyUrl = API_CONFIG.fallbackProxies[i];
                const fullUrl = proxyUrl + encodeURIComponent('https://api.anthropic.com/v1/messages');
                
                const response = await fetch(fullUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify(requestData)
                });

                if (response.ok) {
                    return await response.json();
                } else {
                    console.warn(`Fallback proxy ${i + 1} failed with status: ${response.status}`);
                }
            } catch (error) {
                console.warn(`Fallback proxy ${i + 1} failed with error:`, error.message);
                if (i === API_CONFIG.fallbackProxies.length - 1) {
                    throw error; // Re-throw if all proxies failed
                }
            }
        }
        
        throw new Error('All CORS proxies failed');
    }
}

// Function to get API key from various sources
function getAPIKey() {
    // Try to get from localStorage first (for user-entered keys)
    const storedKey = localStorage.getItem('anthropic_api_key');
    if (storedKey) {
        return storedKey;
    }
    
    // Try to get from environment variable (if available)
    if (typeof process !== 'undefined' && process.env && process.env.ANTHROPIC_API_KEY) {
        return process.env.ANTHROPIC_API_KEY;
    }
    
    // Check if there's a global variable set
    if (typeof window !== 'undefined' && window.ANTHROPIC_API_KEY) {
        return window.ANTHROPIC_API_KEY;
    }
    
    return null;
}

// Function to set API key (for user input)
function setAPIKey(apiKey) {
    if (apiKey && apiKey.trim()) {
        localStorage.setItem('anthropic_api_key', apiKey.trim());
        return true;
    }
    return false;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, getAPIUrl, makeAPIRequest };
}