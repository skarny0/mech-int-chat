// Test script for persona-vector Modal endpoint
const MODAL_API_KEY = 'K4lMBA22qJLfQOvC88K0AegrS2dqVEnh';
const PERSONA_VECTOR_ENDPOINT = 'https://antbaez9--gemma-chat-api-persona-vector-endpoint.modal.run';

async function testPersonaVector() {
    console.log('Testing Persona Vector endpoint...');
    console.log('Endpoint:', PERSONA_VECTOR_ENDPOINT);
    
    const testData = {
        system: "You are a helpful and friendly assistant who answers questions clearly and concisely."
    };
    
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    try {
        const response = await fetch(PERSONA_VECTOR_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': MODAL_API_KEY
            },
            body: JSON.stringify(testData)
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Success! Response data:', JSON.stringify(data, null, 2));
        } else {
            const errorText = await response.text();
            console.log('❌ Error response:', response.status, errorText);
        }
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

// Run the test
testPersonaVector();
