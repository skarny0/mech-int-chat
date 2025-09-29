// Enhanced Chat Interface JavaScript with System Prompt Configuration
let messageIdCounter = 2; // Start from 2 since we have initial message with ID 1
let conversationHistory = []; // Store conversation history for API calls

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
    const assistantName = $('#assistantName');
    const assistantPersonality = $('input[name="assistantPersonality"]');
    const customPersonalityGroup = $('#customPersonalityGroup');
    const customPersonality = $('#customPersonality');
    const assistantDescription = $('#assistantDescription');
    const systemPromptPreview = $('#systemPromptPreview');
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
        // Show/hide custom personality field
        assistantPersonality.on('change', function() {
            if ($(this).val() === 'custom') {
                customPersonalityGroup.show();
            } else {
                customPersonalityGroup.hide();
            }
            updatePreview();
        });

        // Update preview when any field changes
        [assistantName, assistantPersonality, customPersonality, assistantDescription].forEach(element => {
            element.on('input change', updatePreview);
        });

        // Reset configuration
        resetConfig.on('click', function() {
            assistantName.val('');
            assistantPersonality.filter('[value="professional"]').prop('checked', true);
            customPersonalityGroup.hide();
            customPersonality.val('');
            assistantDescription.val('');
            updatePreview();
        });

        // Start chat
        startChatBtn.on('click', function() {
            const systemPrompt = systemPromptPreview.find('.preview-text').text();
            
            // Store system prompt in localStorage for the chat interface
            localStorage.setItem('customSystemPrompt', systemPrompt);
            
            // Switch to chat interface
            switchToChat();
        });

        // Back to configuration
        backToConfigBtn.on('click', function() {
            switchToSystemPromptConfig();
        });

        // Initialize preview
        updatePreview();
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
        conversationHistory.push({
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
                messages: conversationHistory,
                system: customSystemPrompt
            };

            const data = await makeAPIRequest(requestData);
            
            // Hide typing indicator
            typingIndicator.hide();

            // Extract the assistant's response
            const assistantMessage = data.content[0].text;
            
            // Add assistant message to conversation history
            conversationHistory.push({
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
            conversationHistory.push({
                role: 'assistant',
                content: errorMessage
            });
        }
    }

    // Add message to chat with enhanced features
    function addMessage(text, sender) {
        const messageId = messageIdCounter++;
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
                    <div class="message-actions">
                        <button class="action-btn" onclick="copyMessage(${messageId})" title="Copy message">
                            <i class="fas fa-copy"></i>
                        </button>
                        ${sender === 'assistant' ? `
                        <button class="action-btn" onclick="regenerateMessage(${messageId})" title="Regenerate">
                            <i class="fas fa-redo"></i>
                        </button>
                        <button class="action-btn" onclick="likeMessage(${messageId})" title="Like">
                            <i class="fas fa-thumbs-up"></i>
                        </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        messagesContainer.append(messageHtml);
        messagesContainer.scrollTop(messagesContainer[0].scrollHeight);
        return messageId;
    }

    // Generate system prompt preview
    function updatePreview() {
        const name = assistantName.val() || 'AI Assistant';
        const personality = assistantPersonality.filter(':checked').val();
        const customPersonalityText = customPersonality.val();
        const description = assistantDescription.val();

        let systemPrompt = `You are ${name}. `;

        // Add personality
        if (personality === 'custom' && customPersonalityText) {
            systemPrompt += customPersonalityText + ' ';
        } else {
            const personalityMap = {
                'professional': 'You maintain a professional and formal tone in all interactions.',
                'friendly': 'You are friendly, approachable, and conversational in your responses.',
                'expert': 'You speak as a knowledgeable expert with authority and precision.',
                'creative': 'You are imaginative, creative, and think outside the box.',
                'analytical': 'You approach problems methodically and provide detailed analysis.'
            };
            systemPrompt += personalityMap[personality] + ' ';
        }

        // Add description
        if (description) {
            systemPrompt += description + ' ';
        }

        systemPrompt += 'Always be helpful, accurate, and respectful.';

        systemPromptPreview.html(`<p class="preview-text">${systemPrompt}</p>`);
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
        conversationHistory = [];
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
                    <div class="message-actions">
                        <button class="action-btn" onclick="copyMessage(1)" title="Copy message">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="action-btn" onclick="regenerateMessage(1)" title="Regenerate">
                            <i class="fas fa-redo"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        messagesContainer.append(welcomeMessage);
        messageIdCounter = 2;
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
        if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].role === 'assistant') {
            conversationHistory.pop();
        }
        
        // Call AI API for a new response
        const customSystemPrompt = localStorage.getItem('customSystemPrompt') || 
            "You are a helpful research assistant for the MIT Media Lab Chat Study. Provide thoughtful, informative responses to help participants with their research questions. Be conversational and engaging while maintaining a professional tone.";

        const requestData = {
            model: API_CONFIG.model,
            max_tokens: API_CONFIG.maxTokens,
            messages: conversationHistory,
            system: customSystemPrompt
        };

        const data = await makeAPIRequest(requestData);
        const newResponse = data.content[0].text;
        
        // Update the message text
        messageText.text(newResponse);
        
        // Add the new response to conversation history
        conversationHistory.push({
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