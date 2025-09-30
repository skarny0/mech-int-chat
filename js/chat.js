// Enhanced Chat Interface JavaScript with System Prompt Configuration
// Initialize global variables if they don't exist
if (typeof window.messageIdCounter === 'undefined') {
    window.messageIdCounter = 2; // Start from 2 since we have initial message with ID 1
}
if (typeof window.conversationHistory === 'undefined') {
    window.conversationHistory = []; // Store conversation history for API calls
}

// Note: API configuration is loaded from config-unified.js file

$(document).ready(function() {
    // Initialize the dynamic interface
    initializeDynamicInterface();
});

function initializeDynamicInterface() {
    const systemPromptInterface = $('#systemPromptInterface');
    const chatInterface = $('#chatInterface');
    const messagesContainer = $('#messagesContainer');
    const messageInput = $('#messageInput');
    const sendBtn = $('#sendBtn');
    const typingIndicator = $('#typingIndicator');
    const attachBtn = $('#attachBtn');
    const imageBtn = $('#imageBtn');
    const systemPromptInfo = $('#systemPromptInfo');

    // System prompt configuration elements
    const resetConfig = $('#resetConfig');
    const startChatBtn = $('#startChatBtn');
    const backToConfigBtn = $('#backToConfigBtn');

    // Check if custom system prompt is being used
    const customSystemPrompt = localStorage.getItem('customSystemPrompt');
    if (customSystemPrompt) {
        systemPromptInfo.show();
    }

    // Initialize system prompt configuration
    initializeSystemPromptConfig();
    
    // Initialize chat functionality
    initializeChatFunctionality();

    function initializeSystemPromptConfig() {
        // Get the system prompt input
        const systemPromptInput = $('#systemPromptInput');

        // Reset configuration
        resetConfig.on('click', function() {
            systemPromptInput.val('You are a helpful research assistant for the MIT Media Lab Chat Study. Provide thoughtful, informative responses to help participants with their research questions. Be conversational and engaging while maintaining a professional tone.');
        });

        // Start chat
        startChatBtn.on('click', function() {
            const systemPrompt = $('#systemPromptInput').val();
            
            // Store system prompt in localStorage for the chat interface
            localStorage.setItem('customSystemPrompt', systemPrompt);
            
            // Switch to chat interface
            switchToChat();
        });

        // Check Persona button
        $('#checkPersonaBtn').on('click', function() {
            // Get the current system prompt from the input
            const systemPrompt = $('#systemPromptInput').val();
            checkPersona(systemPrompt);
        });

        // Test Persona button - simulate with mock data
        $('#testPersonaBtn').on('click', function() {
            testPersonaWithMockData();
        });

        // Helper function to show/hide persona sections
        window.showPersonaVisualization = function() {
            $('#personaVisualization').show();
            $('#personaPlaceholder').hide();
        };

        window.hidePersonaVisualization = function() {
            $('#personaVisualization').hide();
            $('#personaPlaceholder').show();
        };

        // Back to configuration
        backToConfigBtn.on('click', function() {
            switchToSystemPromptConfig();
        });

    }

    function initializeChatFunctionality() {
        // Check if custom system prompt is being used
        const customSystemPrompt = localStorage.getItem('customSystemPrompt');
        if (customSystemPrompt) {
            systemPromptInfo.show();
        }

        // Enable/disable send button based on input
        messageInput.on('input', function() {
            sendBtn.prop('disabled', messageInput.val().trim() === '');
        });

        // Auto-resize textarea
        messageInput.on('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });

        // Event listeners
        sendBtn.on('click', sendMessage);
        
        messageInput.on('keypress', function(e) {
            if (e.which === 13 && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Attach button functionality
        attachBtn.on('click', function() {
            // Placeholder for file attachment
            alert('File attachment feature would be implemented here');
        });

        // Image button functionality
        imageBtn.on('click', function() {
            // Placeholder for image sending
            alert('Image sending feature would be implemented here');
        });
    }

    // Send message function
    function sendMessage() {
        const message = messageInput.val().trim();
        if (message === '') return;

        // Add user message
        const userMessageId = addMessage(message, 'user');
        messageInput.val('');
        sendBtn.prop('disabled', true);
        messageInput.css('height', 'auto');

        // Add user message to conversation history
        window.conversationHistory.push({
            role: 'user',
            content: message
        });

        // Show typing indicator
        typingIndicator.show();

        // Call AI API for response
        callAIAPI(message);
    }

    // Function to call AI API (generalized for both Claude and Modal)
    async function callAIAPI(userMessage) {
        try {
            // Get custom system prompt from localStorage, fallback to default
            const customSystemPrompt = localStorage.getItem('customSystemPrompt') || 
                "You are a helpful research assistant for the MIT Media Lab Chat Study. Provide thoughtful, informative responses to help participants with their research questions. Be conversational and engaging while maintaining a professional tone.";

            const requestData = {
                model: API_CONFIG.model,
                max_tokens: API_CONFIG.maxTokens,
                messages: window.conversationHistory,
                system: customSystemPrompt
            };

            const data = await makeAPIRequest(requestData);
            
            // Hide typing indicator
            typingIndicator.hide();

            // Extract the assistant's response
            const assistantMessage = data.content[0].text;
            
            // Add assistant message to conversation history
            window.conversationHistory.push({
                role: 'assistant',
                content: assistantMessage
            });

            // Add assistant message to chat
            addMessage(assistantMessage, 'assistant');

        } catch (error) {
            console.error('Error calling AI API:', error);
            
            // Hide typing indicator
            typingIndicator.hide();
            
            // Show appropriate error message based on error type
            let errorMessage;
            if (error.message.includes('API key not found') || error.message.includes('not configured')) {
                errorMessage = `API configuration error: ${error.message}. Please check your API settings.`;
            } else if (error.message.includes('CORS')) {
                errorMessage = `CORS Error: ${error.message}. This might be due to network restrictions. Please try again or contact the study administrator.`;
            } else if (error.message.includes('Rate limit exceeded')) {
                errorMessage = `Rate limit exceeded. Please wait a moment and try again.`;
            } else if (error.message.includes('Invalid API key') || error.message.includes('Invalid')) {
                errorMessage = `Invalid configuration: ${error.message}. Please check your API settings and try again.`;
            } else {
                errorMessage = `Error: ${error.message}. Please try again or contact the study administrator.`;
            }
            
            addMessage(errorMessage, 'assistant');
            
            // Add error message to conversation history
            window.conversationHistory.push({
                role: 'assistant',
                content: errorMessage
            });
        }
    }

    // Add message to chat with enhanced features
    function addMessage(text, sender) {
        const messageId = window.messageIdCounter++;
        const messageClass = sender === 'user' ? 'user-message' : 'assistant-message';
        const avatarIcon = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
        const senderName = sender === 'user' ? 'You' : 'Assistant';
        const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const messageHtml = `
            <div class="message ${messageClass}" data-message-id="${messageId}">
                <div class="message-avatar">
                    <i class="${avatarIcon}"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">${text}</div>
                </div>
            </div>
        `;
        
        messagesContainer.append(messageHtml);
        messagesContainer.scrollTop(messagesContainer[0].scrollHeight);
        return messageId;
    }


    // Interface switching functions
    function switchToChat() {
        systemPromptInterface.hide();
        chatInterface.show();
        systemPromptInfo.show();
    }

    function switchToSystemPromptConfig() {
        chatInterface.hide();
        systemPromptInterface.show();
    }

    // Add clear conversation function
    window.clearConversation = function() {
        window.conversationHistory = [];
        messagesContainer.empty();
        // Add welcome message back
        const welcomeMessage = `
            <div class="message assistant-message" data-message-id="1">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">
                        Welcome to the MIT Media Lab Chat Study! I'm here to help you with your research questions. How can I assist you today?
                    </div>
                </div>
            </div>
        `;
        messagesContainer.append(welcomeMessage);
        window.messageIdCounter = 2;
    };

    // Add function to get current provider info
    window.getCurrentProvider = function() {
        return {
            config: API_CONFIG
        };
    };
}

// Global functions for message actions
function copyMessage(messageId) {
    const messageElement = $(`[data-message-id="${messageId}"]`);
    const messageText = messageElement.find('.message-text').text();
    
    navigator.clipboard.writeText(messageText).then(function() {
        // Show temporary feedback
        const btn = messageElement.find('.action-btn').first();
        const originalIcon = btn.find('i').attr('class');
        btn.find('i').attr('class', 'fas fa-check');
        setTimeout(() => {
            btn.find('i').attr('class', originalIcon);
        }, 1000);
    });
}

async function regenerateMessage(messageId) {
    const messageElement = $(`[data-message-id="${messageId}"]`);
    const messageText = messageElement.find('.message-text');
    
    // Show loading state
    messageText.html('<i class="fas fa-spinner fa-spin"></i> Regenerating...');
    
    try {
        // Remove the last assistant message from conversation history
        if (window.conversationHistory.length > 0 && window.conversationHistory[window.conversationHistory.length - 1].role === 'assistant') {
            window.conversationHistory.pop();
        }
        
        // Call AI API for a new response
        const customSystemPrompt = localStorage.getItem('customSystemPrompt') || 
            "You are a helpful research assistant for the MIT Media Lab Chat Study. Provide thoughtful, informative responses to help participants with their research questions. Be conversational and engaging while maintaining a professional tone.";

        const requestData = {
            model: API_CONFIG.model,
            max_tokens: API_CONFIG.maxTokens,
            messages: window.conversationHistory,
            system: customSystemPrompt
        };

        const data = await makeAPIRequest(requestData);
        const newResponse = data.content[0].text;
        
        // Update the message text
        messageText.text(newResponse);
        
        // Add the new response to conversation history
        window.conversationHistory.push({
            role: 'assistant',
            content: newResponse
        });

    } catch (error) {
        console.error('Error regenerating message:', error);
        messageText.text(`I'm having trouble regenerating that response right now. Please try again later.`);
    }
}

function likeMessage(messageId) {
    const messageElement = $(`[data-message-id="${messageId}"]`);
    const likeBtn = messageElement.find('.action-btn').last();
    
    // Toggle like state
    if (likeBtn.hasClass('liked')) {
        likeBtn.removeClass('liked');
        likeBtn.find('i').attr('class', 'fas fa-thumbs-up');
    } else {
        likeBtn.addClass('liked');
        likeBtn.find('i').attr('class', 'fas fa-thumbs-up');
        // Show temporary feedback
        likeBtn.find('i').attr('class', 'fas fa-check');
        setTimeout(() => {
            likeBtn.find('i').attr('class', 'fas fa-thumbs-up');
        }, 1000);
    }
}

// Check Persona function - calls persona-vector endpoint
async function checkPersona(systemPrompt) {
    try {
        // Use provided system prompt or get from localStorage
        const promptToUse = systemPrompt || 
            localStorage.getItem('customSystemPrompt') || 
            "You are a helpful research assistant for the MIT Media Lab Chat Study. Provide thoughtful, informative responses to help participants with their research questions. Be conversational and engaging while maintaining a professional tone.";

        console.log('Calling persona-vector endpoint with system prompt:', promptToUse);

        // Show loading state
        showPersonaVisualization();
        const personaChart = $('#personaChart');
        personaChart.html('<div style="text-align: center; color: var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Analyzing persona...</div>');

        // Call the persona-vector endpoint
        const response = await fetch('/api/persona-vector', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                system: promptToUse
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Persona Vector Response:', data);
            
            // Render the persona vector bar chart
            renderPersonaChart(data.content);
        } else {
            const errorData = await response.json();
            console.error('Persona Vector Error:', errorData);
            personaChart.html(`<div style="text-align: center; color: var(--error-color);">Error: ${errorData.error}</div>`);
        }
    } catch (error) {
        console.error('Error calling persona-vector endpoint:', error);
        const personaChart = $('#personaChart');
        personaChart.html(`<div style="text-align: center; color: var(--error-color);">Failed to analyze persona: ${error.message}</div>`);
    }
}

// Render persona vector bar chart
function renderPersonaChart(personaData) {
    const personaChart = $('#personaChart');
    
    if (!personaData || typeof personaData !== 'object') {
        personaChart.html('<div style="text-align: center; color: var(--text-muted);">No persona data available</div>');
        return;
    }

    // Create bar chart HTML
    let chartHtml = '';
    
    for (const [key, value] of Object.entries(personaData)) {
        // Calculate position and width for the bar
        // Value range is -2 to 2, we need to map this to 0-100%
        const normalizedValue = ((value + 2) / 4) * 100; // Convert -2 to 2 range to 0-100
        const barWidth = Math.abs(value) / 2 * 50; // Width from center (0-50%)
        const barLeft = value < 0 ? (50 - barWidth) : 50; // Start position
        const barClass = value < 0 ? 'negative' : 'positive';
        
        chartHtml += `
            <div class="persona-bar-item">
                <div class="persona-bar-label">
                    <span class="persona-bar-name">${key}</span>
                    <span class="persona-bar-value">${value.toFixed(3)}</span>
                </div>
                <div class="persona-bar-track">
                    <div class="persona-bar-background"></div>
                    <div class="persona-bar-center"></div>
                    <div class="persona-bar-fill ${barClass}" style="left: ${barLeft}%; width: ${barWidth}%;"></div>
                </div>
            </div>
        `;
    }
    
    // Add axis labels
    chartHtml += `
        <div class="persona-axis" style="margin-top: 1rem;">
            <div class="persona-axis-tick">-2.0</div>
            <div class="persona-axis-tick">-1.0</div>
            <div class="persona-axis-tick">0.0</div>
            <div class="persona-axis-tick">1.0</div>
            <div class="persona-axis-tick">2.0</div>
        </div>
    `;
    
    personaChart.html(chartHtml);
}

// Test persona with mock data - for development/testing without API calls
function testPersonaWithMockData() {
    const personaChart = $('#personaChart');
    
    // Show loading state
    showPersonaVisualization();
    personaChart.html('<div style="text-align: center; color: var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Generating test data...</div>');
    
    // Simulate API delay
    setTimeout(() => {
        // Generate random mock data in the range of -2 to 2
        const mockData = {
            empathy: (Math.random() * 4 - 2), // Random value between -2 and 2
            sycophancy: (Math.random() * 4 - 2),
            humor: (Math.random() * 4 - 2),
            toxicity: (Math.random() * 4 - 2),
            formality: (Math.random() * 4 - 2),
            creativity: (Math.random() * 4 - 2)
        };
        
        console.log('Mock Persona Data:', mockData);
        renderPersonaChart(mockData);
    }, 800); // Simulate network delay
}
