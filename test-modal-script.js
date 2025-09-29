// Test script for Modal endpoint - same as in test-modal.html
const MODAL_API_KEY = 'K4lMBA22qJLfQOvC88K0AegrS2dqVEnh';
const MODAL_ENDPOINT = 'https://antbaez9--gemma-chat-api-chat-endpoint.modal.run';

async function testModalEndpoint() {
    console.log('Testing Modal endpoint...');
    console.log('Endpoint:', MODAL_ENDPOINT);
    console.log('API Key:', MODAL_API_KEY.substring(0, 10) + '...');
    
    const testData = {
        model: 'gemma-2-2b-it',
        messages: [{ role: 'user', content: 'Hello! Can you tell me a short joke?' }],
        max_tokens: 100
    };
    
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    try {
        const response = await fetch(MODAL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': MODAL_API_KEY
            },
            body: JSON.stringify(testData)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Success! Response data:', JSON.stringify(data, null, 2));
            
            // Extract the actual response text
            if (data.content && data.content[0] && data.content[0].text) {
                console.log('🤖 AI Response:', data.content[0].text);
            } else if (data.response) {
                console.log('🤖 AI Response:', data.response);
            } else {
                console.log('🤖 AI Response:', data);
            }
        } else {
            const errorText = await response.text();
            console.log('❌ Error response:', response.status, errorText);
        }
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

// Run the test
testModalEndpoint();
