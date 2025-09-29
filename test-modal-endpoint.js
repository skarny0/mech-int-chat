// Test script for Modal endpoint
const testModalEndpoint = async () => {
    const testData = {
        messages: [
            {
                role: "user",
                content: "Hello! Can you tell me a short joke?"
            }
        ],
        model: "gemma-2-2b-it",
        max_tokens: 100,
        system: "You are a helpful assistant. Keep responses brief and friendly."
    };

    try {
        console.log('Testing Modal endpoint...');
        console.log('Request data:', JSON.stringify(testData, null, 2));
        
        const response = await fetch('/api/modal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Success! Response data:', JSON.stringify(data, null, 2));
        } else {
            const errorData = await response.json();
            console.log('❌ Error response:', JSON.stringify(errorData, null, 2));
        }
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
};

// Run the test
testModalEndpoint();
