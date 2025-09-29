export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get Modal API key from environment variables
    const modalApiKey = process.env.MODAL_API_KEY;
    if (!modalApiKey) {
      return res.status(500).json({ 
        error: 'Modal API key not configured. Please set MODAL_API_KEY environment variable.' 
      });
    }

    // Extract request data
    const { messages, model, max_tokens = 1000, system } = req.body;

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Invalid request: messages array is required' 
      });
    }

    // Prepare the request for Modal API
    const requestData = {
      messages: messages,
      max_tokens: max_tokens,
    };

    // Add optional parameters if provided
    if (model) {
      requestData.model = model;
    }
    if (system) {
      requestData.system = system;
    }

    // Call Modal API
    const response = await fetch('https://api.modal.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${modalApiKey}`,
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Modal API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Return the response in a format consistent with Claude API
    return res.status(200).json({
      content: data.content || [{ text: data.response || data.message || 'No response received' }],
      usage: data.usage || { input_tokens: 0, output_tokens: 0 },
      model: data.model || 'modal-model',
      stop_reason: data.stop_reason || 'end_turn'
    });

  } catch (error) {
    console.error('Error calling Modal API:', error);
    
    // Return appropriate error response
    if (error.message.includes('Modal API error: 401')) {
      return res.status(401).json({ 
        error: 'Invalid Modal endpoint or authentication. Please check your Modal configuration.' 
      });
    } else if (error.message.includes('Modal API error: 429')) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      });
    } else if (error.message.includes('Modal API error: 400')) {
      return res.status(400).json({ 
        error: 'Invalid request: ' + (error.message || 'Bad request') 
      });
    } else {
      return res.status(500).json({ 
        error: 'Internal server error: ' + (error.message || 'Unknown error') 
      });
    }
  }
}