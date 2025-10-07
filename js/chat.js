// initialize firebase
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBnlqrGcIfgo59WCzure6azGQitEQaGhZg",
    authDomain: "mech-chat-ee0c5.firebaseapp.com",
    databaseURL: "https://mech-chat-ee0c5-default-rtdb.firebaseio.com",
    projectId: "mech-chat-ee0c5",
    storageBucket: "mech-chat-ee0c5.firebasestorage.app",
    messagingSenderId: "1027129084043",
    appId: "1:1027129084043:web:ece77d746e79110f98ec8e"
  };

// Import Firebase functions from v1.0 (auto-initializes)
import { 
    writeRealtimeDatabase, writeURLParameters, readRealtimeDatabase,
    blockRandomization, finalizeBlockRandomization, firebaseUserId 
} from "./firebasepsych1.0.js";

console.log("Firebase UserId=" + firebaseUserId);

// Write a simple test case to the database
const studyId = 'chat-study';
const testPath = studyId + '/participantData/' + firebaseUserId + '/testMessage';
const testValue = {
    message: "Hello from chat.js!",
    timestamp: new Date().toISOString(),
    value: 42
};

await writeRealtimeDatabase(testPath, testValue);
console.log("✅ Test data written to Firebase at path:", testPath);

// Write URL parameters to Firebase
const urlParamsPath = studyId + '/participantData/' + firebaseUserId + '/urlParameters';
await writeURLParameters(urlParamsPath);
console.log("✅ URL parameters saved to Firebase");

// Enhanced Chat Interface JavaScript with System Prompt Configuration
// Initialize global variables if they don't exist
if (typeof window.messageIdCounter === 'undefined') {
    window.messageIdCounter = 2; // Start from 2 since we have initial message with ID 1
}
if (typeof window.conversationHistory === 'undefined') {
    window.conversationHistory = []; // Store conversation history for API calls
}
if (typeof window.lastSystemPrompt === 'undefined') {
    window.lastSystemPrompt = null; // Track the last system prompt used
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

    // System prompt configuration elements
    const resetConfig = $('#resetConfig');
    const startChatBtn = $('#startChatBtn');
    const backToConfigBtn = $('#backToConfigBtn');

    // Initialize system prompt configuration
    initializeSystemPromptConfig();
    
    // Initialize chat functionality
    initializeChatFunctionality();

    function initializeSystemPromptConfig() {
        // Get the system prompt input
        const systemPromptInput = $('#systemPromptInput');

        // Initialize survey
        initializePreTaskSurvey();

        // Reset configuration
        resetConfig.on('click', async function() {
            const defaultPrompt = 'You are a helpful research assistant for the MIT Media Lab Chat Study. Provide thoughtful, informative responses to help participants with their research questions. Be conversational and engaging while maintaining a professional tone.';
            systemPromptInput.val(defaultPrompt);
            
            // Log this reset action to Firebase
            const promptLogPath = studyId + '/participantData/' + firebaseUserId + '/systemPromptLog/' + Date.now();
            await writeRealtimeDatabase(promptLogPath, {
                prompt: defaultPrompt,
                action: 'reset_to_default',
                timestamp: new Date().toISOString()
            });
            console.log('✅ System prompt reset logged');
        });

        // Start chat
        startChatBtn.on('click', async function() {
            const systemPrompt = $('#systemPromptInput').val();
            
            // Check if system prompt has changed
            const promptChanged = window.lastSystemPrompt !== null && window.lastSystemPrompt !== systemPrompt;
            
            if (promptChanged) {
                console.log('🔄 System prompt changed - clearing chat history');
                
                // Log the chat history clear event to Firebase
                const clearLogPath = studyId + '/participantData/' + firebaseUserId + '/chatHistoryClearLog/' + Date.now();
                await writeRealtimeDatabase(clearLogPath, {
                    previousPrompt: window.lastSystemPrompt,
                    newPrompt: systemPrompt,
                    timestamp: new Date().toISOString(),
                    reason: 'system_prompt_changed'
                });
                console.log('✅ Chat history clear logged');
                
                // Clear conversation history
                window.conversationHistory = [];
                // Clear chat UI
                const messagesContainer = $('#messagesContainer');
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
                // Reset message counter
                window.messageIdCounter = 2;
            }
            
            // Update last system prompt
            window.lastSystemPrompt = systemPrompt;
            
            // Store system prompt in localStorage for the chat interface
            localStorage.setItem('customSystemPrompt', systemPrompt);
            console.log('📝 System prompt saved to localStorage:', systemPrompt.substring(0, 50) + '...');
            
            // Log this system prompt attempt to Firebase
            const promptLogPath = studyId + '/participantData/' + firebaseUserId + '/systemPromptLog/' + Date.now();
            await writeRealtimeDatabase(promptLogPath, {
                prompt: systemPrompt,
                action: 'start_chat',
                timestamp: new Date().toISOString()
            });
            console.log('✅ System prompt logged (start chat)');
            
            // Save system prompt to Firebase
            const systemPromptPath = studyId + '/participantData/' + firebaseUserId + '/systemPrompt';
            await writeRealtimeDatabase(systemPromptPath, {
                prompt: systemPrompt,
                timestamp: new Date().toISOString()
            });
            console.log('✅ System prompt saved to Firebase');
            
            // Switch to chat interface
            switchToChat();
        });

        // Check Persona button - show survey first if not completed
        $('#checkPersonaBtn').on('click', async function() {
            // Get the current system prompt from the input
            const systemPrompt = $('#systemPromptInput').val();
            
            // Log this system prompt attempt to Firebase
            const promptLogPath = studyId + '/participantData/' + firebaseUserId + '/systemPromptLog/' + Date.now();
            await writeRealtimeDatabase(promptLogPath, {
                prompt: systemPrompt,
                action: 'check_persona',
                timestamp: new Date().toISOString()
            });
            console.log('✅ System prompt logged (check persona)');
            
            // Check if survey has been completed
            const surveyCompleted = localStorage.getItem('preTaskSurveyCompleted');
            
            if (!surveyCompleted) {
                // Show survey modal and store which action to perform after
                window.postSurveyAction = 'checkPersona';
                showPreTaskSurvey();
            } else {
                // Survey already completed, proceed with persona check
                checkPersona(systemPrompt);
            }
        });

        // Test Persona button - simulate with mock data, also show survey if not completed
        $('#testPersonaBtn').on('click', async function() {
            // Get the current system prompt from the input
            const systemPrompt = $('#systemPromptInput').val();
            
            // Log this system prompt attempt to Firebase
            const promptLogPath = studyId + '/participantData/' + firebaseUserId + '/systemPromptLog/' + Date.now();
            await writeRealtimeDatabase(promptLogPath, {
                prompt: systemPrompt,
                action: 'test_persona',
                timestamp: new Date().toISOString()
            });
            console.log('✅ System prompt logged (test persona)');
            
            // Check if survey has been completed
            const surveyCompleted = localStorage.getItem('preTaskSurveyCompleted');
            
            if (!surveyCompleted) {
                // Show survey modal and store which action to perform after
                window.postSurveyAction = 'testPersona';
                showPreTaskSurvey();
            } else {
                // Survey already completed, proceed with test
                testPersonaWithMockData();
            }
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
    async function sendMessage() {
        const message = messageInput.val().trim();
        if (message === '') return;

        // Add user message to conversation history first
        window.conversationHistory.push({
            role: 'user',
            content: message
        });

        // Add user message to UI and save to Firebase
        const userMessageId = await addMessage(message, 'user');
        messageInput.val('');
        sendBtn.prop('disabled', true);
        messageInput.css('height', 'auto');

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

            console.log('💬 Sending message with system prompt:', customSystemPrompt.substring(0, 50) + '...');

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

            // Add assistant message to chat and save to Firebase
            await addMessage(assistantMessage, 'assistant');

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
            
            // Add error message to conversation history
            window.conversationHistory.push({
                role: 'assistant',
                content: errorMessage
            });
            
            // Add error message to chat and save to Firebase
            await addMessage(errorMessage, 'assistant');
        }
    }

    // Add message to chat with enhanced features
    async function addMessage(text, sender) {
        const messageId = window.messageIdCounter++;
        const messageClass = sender === 'user' ? 'user-message' : 'assistant-message';
        const avatarIcon = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
        const senderName = sender === 'user' ? 'You' : 'Assistant';
        const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const timestamp = new Date().toISOString();
        
        // Get the current system prompt being used
        const currentSystemPrompt = localStorage.getItem('customSystemPrompt') || 
            "You are a helpful research assistant for the MIT Media Lab Chat Study. Provide thoughtful, informative responses to help participants with their research questions. Be conversational and engaging while maintaining a professional tone.";
        
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
        
        // Save message to Firebase with system prompt
        const messagePath = studyId + '/participantData/' + firebaseUserId + '/messages/' + messageId;
        await writeRealtimeDatabase(messagePath, {
            messageId: messageId,
            role: sender,
            content: text,
            timestamp: timestamp,
            systemPrompt: currentSystemPrompt
        });
        
        // Also save the full conversation history after each message
        const conversationPath = studyId + '/participantData/' + firebaseUserId + '/conversationHistory';
        await writeRealtimeDatabase(conversationPath, window.conversationHistory);
        
        return messageId;
    }


    // Interface switching functions
    function switchToChat() {
        systemPromptInterface.hide();
        chatInterface.show();
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
            console.log('📊 Persona Vector API Response:', data.content);
            
            // Save persona vector to history log
            const personaLogPath = studyId + '/participantData/' + firebaseUserId + '/personaVectorLog/' + Date.now();
            await writeRealtimeDatabase(personaLogPath, {
                personaVector: data.content,
                systemPrompt: promptToUse,
                timestamp: new Date().toISOString()
            });
            console.log('✅ Persona vector logged to history');
            
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

// Render persona vector chart (sunburst or bar chart based on URL parameter)
// Uses ?sunburst=true or ?sunburst=false URL parameter (defaults to true if not specified)
function renderPersonaChart(personaData) {
    const personaChart = $('#personaChart');
    
    // Use URL parameter to determine display mode (defaults to true if not specified)
    const useSunburst = typeof useSunburstDisplay === 'function' ? useSunburstDisplay() : true;
    
    if (!personaData || typeof personaData !== 'object') {
        personaChart.html('<div style="text-align: center; color: var(--text-muted);">No persona data available</div>');
        return;
    }

    // Choose visualization based on config
    if (useSunburst) {
        // Check if D3 is loaded
        if (typeof d3 === 'undefined') {
            console.error('D3.js not loaded! Falling back to bar chart.');
            renderPersonaBarChart(personaData);
            return;
        }
        
        // Create container for sunburst
        personaChart.html('<div id="personaChartSunburst"></div>');
        
        // Create the sunburst visualization
        setTimeout(() => {
            if (typeof createPersonaSunburst === 'function') {
                createPersonaSunburst(personaData, 'personaChartSunburst', {
                    width: 380,
                    height: 380,
                    innerRadius: 45,
                    animate: true
                });
            } else {
                console.error('createPersonaSunburst function not found. Falling back to bar chart.');
                // Fallback to bar chart
                renderPersonaBarChart(personaData);
            }
        }, 100);
    } else {
        // Use original bar chart
        console.log('Using bar chart (sunburst disabled via URL parameter or config)');
        renderPersonaBarChart(personaData);
    }
}

// Original bar chart rendering (fallback or primary based on USE_SUNBURST config)
function renderPersonaBarChart(personaData) {
    const personaChart = $('#personaChart');
    
    let chartHtml = '<div class="persona-fallback-list">';
    
    for (const [key, value] of Object.entries(personaData)) {
        const barWidth = Math.abs(value) / 2 * 50;
        const barLeft = value < 0 ? (50 - barWidth) : 50;
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
    
    chartHtml += `
        <div class="persona-axis" style="margin-top: 1rem;">
            <div class="persona-axis-tick">-2.0</div>
            <div class="persona-axis-tick">-1.0</div>
            <div class="persona-axis-tick">0.0</div>
            <div class="persona-axis-tick">1.0</div>
            <div class="persona-axis-tick">2.0</div>
        </div>
    </div>`;
    
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

// ============================================
// PRE-TASK SURVEY FUNCTIONS
// ============================================

// Initialize pre-task survey
function initializePreTaskSurvey() {
    const surveyModal = $('#preTaskSurveyModal');
    const phase1 = $('#surveyPhase1');
    const phase2 = $('#surveyPhase2');
    const phase3 = $('#surveyPhase3');
    
    const phase1ProceedBtn = $('#phase1ProceedBtn');
    const phase2ProceedBtn = $('#phase2ProceedBtn');
    const phase3ProceedBtn = $('#phase3ProceedBtn');
    
    // Phase 1: Listen to radio button changes
    $('input[name="phase1_q1"], input[name="phase1_q2"]').on('change', function() {
        const q1Answered = $('input[name="phase1_q1"]:checked').length > 0;
        const q2Answered = $('input[name="phase1_q2"]:checked').length > 0;
        phase1ProceedBtn.prop('disabled', !(q1Answered && q2Answered));
    });
    
    // Phase 1 Proceed button
    phase1ProceedBtn.on('click', function() {
        phase1.hide();
        phase2.show();
    });
    
    // Phase 2: Listen to all trait radio buttons
    const traitNames = [
        'trait_empathy', 'trait_nonempathic',
        'trait_sociality', 'trait_antisocial',
        'trait_supportiveness', 'trait_unsupportive',
        'trait_humor', 'trait_humorless',
        'trait_warmth', 'trait_cold',
        'trait_toxicity', 'trait_nontoxic',
        'trait_sycophancy', 'trait_nonsycophantic',
        'trait_deceptiveness', 'trait_truthful',
        'trait_hallucination', 'trait_accurate'
    ];
    
    traitNames.forEach(traitName => {
        $(`input[name="${traitName}"]`).on('change', validatePhase2);
    });
    
    function validatePhase2() {
        const allAnswered = traitNames.every(traitName => {
            return $(`input[name="${traitName}"]:checked`).length > 0;
        });
        phase2ProceedBtn.prop('disabled', !allAnswered);
    }
    
    // Phase 2 Proceed button
    phase2ProceedBtn.on('click', function() {
        phase2.hide();
        phase3.show();
    });
    
    // Phase 3: Listen to trust question
    $('input[name="phase3_trust"]').on('change', function() {
        const trustAnswered = $('input[name="phase3_trust"]:checked').length > 0;
        phase3ProceedBtn.prop('disabled', !trustAnswered);
    });
    
    // Phase 3 Proceed button - save data and close
    phase3ProceedBtn.on('click', async function() {
        await savePreTaskSurveyData();
        closePreTaskSurvey();
        
        // Now trigger the appropriate action based on which button was clicked
        const systemPrompt = $('#systemPromptInput').val();
        const action = window.postSurveyAction || 'checkPersona'; // Default to checkPersona
        
        if (action === 'testPersona') {
            testPersonaWithMockData();
        } else {
            checkPersona(systemPrompt);
        }
        
        // Clear the action flag
        window.postSurveyAction = null;
    });
}

// Show pre-task survey modal
function showPreTaskSurvey() {
    const surveyModal = $('#preTaskSurveyModal');
    surveyModal.show();
    
    // Reset to phase 1
    $('#surveyPhase1').show();
    $('#surveyPhase2').hide();
    $('#surveyPhase3').hide();
    
    console.log('📋 Pre-task survey displayed');
}

// Close pre-task survey modal
function closePreTaskSurvey() {
    const surveyModal = $('#preTaskSurveyModal');
    surveyModal.hide();
    
    // Mark survey as completed
    localStorage.setItem('preTaskSurveyCompleted', 'true');
    
    console.log('✅ Pre-task survey completed and closed');
}

// Collect and save pre-task survey data
async function savePreTaskSurveyData() {
    try {
        // Collect Phase 1 responses
        const phase1Q1 = parseInt($('input[name="phase1_q1"]:checked').val());
        const phase1Q2 = parseInt($('input[name="phase1_q2"]:checked').val());
        
        // Collect Phase 2 responses (trait predictions)
        const traitPredictions = {
            empathy: parseInt($('input[name="trait_empathy"]:checked').val()) / 10, // Normalize to 0-1
            nonempathic: parseInt($('input[name="trait_nonempathic"]:checked').val()) / 10,
            sociality: parseInt($('input[name="trait_sociality"]:checked').val()) / 10,
            antisocial: parseInt($('input[name="trait_antisocial"]:checked').val()) / 10,
            supportiveness: parseInt($('input[name="trait_supportiveness"]:checked').val()) / 10,
            unsupportive: parseInt($('input[name="trait_unsupportive"]:checked').val()) / 10,
            humor: parseInt($('input[name="trait_humor"]:checked').val()) / 10,
            humorless: parseInt($('input[name="trait_humorless"]:checked').val()) / 10,
            warmth: parseInt($('input[name="trait_warmth"]:checked').val()) / 10,
            cold: parseInt($('input[name="trait_cold"]:checked').val()) / 10,
            toxicity: parseInt($('input[name="trait_toxicity"]:checked').val()) / 10,
            nontoxic: parseInt($('input[name="trait_nontoxic"]:checked').val()) / 10,
            sycophancy: parseInt($('input[name="trait_sycophancy"]:checked').val()) / 10,
            nonsycophantic: parseInt($('input[name="trait_nonsycophantic"]:checked').val()) / 10,
            deceptiveness: parseInt($('input[name="trait_deceptiveness"]:checked').val()) / 10,
            truthful: parseInt($('input[name="trait_truthful"]:checked').val()) / 10,
            hallucination: parseInt($('input[name="trait_hallucination"]:checked').val()) / 10,
            accurate: parseInt($('input[name="trait_accurate"]:checked').val()) / 10
        };
        
        // Collect Phase 3 response
        const phase3Trust = parseInt($('input[name="phase3_trust"]:checked').val());
        
        // Get system prompt
        const systemPrompt = $('#systemPromptInput').val();
        
        // Create survey data object
        const surveyData = {
            phase1: {
                q1_unintended_behaviors: phase1Q1,
                q2_negative_unintended_behaviors: phase1Q2
            },
            phase2: {
                trait_predictions: traitPredictions
            },
            phase3: {
                trust_rating: phase3Trust
            },
            metadata: {
                system_prompt: systemPrompt,
                timestamp: new Date().toISOString(),
                completion_time: Date.now()
            }
        };
        
        console.log('📊 Pre-task survey data collected:', surveyData);
        
        // Store locally first (primary storage for now)
        localStorage.setItem('preTaskSurveyData', JSON.stringify(surveyData));
        console.log('✅ Pre-task survey data saved to localStorage');
        
        // Save to Firebase using firebasepsych1.0.js API
        try {
            const surveyPath = `${studyId}/participantData/${firebaseUserId}/preTaskSurvey`;
            await writeRealtimeDatabase(surveyPath, surveyData);
            console.log('✅ Pre-task survey data saved to Firebase at path:', surveyPath);
        } catch (firebaseError) {
            console.warn('⚠️ Could not save to Firebase:', firebaseError.message);
        }
        
    } catch (error) {
        console.error('❌ Error collecting pre-task survey data:', error);
        // Even if there's an error, don't throw - allow the survey to complete
    }
}
