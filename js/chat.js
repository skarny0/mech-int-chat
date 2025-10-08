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
let studyId;
if (DEBUG){
    studyId = 'pilot-oct8-debug';
} else {
    studyId = 'pilot-oct8';
}

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

// Timer variables
if (typeof window.timerStartTime === 'undefined') {
    window.timerStartTime = null;
}
if (typeof window.timerInterval === 'undefined') {
    window.timerInterval = null;
}
if (typeof window.timerDuration === 'undefined') {
    // Check for debug mode via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const debugTimer = urlParams.get('debugTimer') === 'true';
    window.timerDuration = debugTimer ? 10 : 600; // 10 seconds for debug, 10 minutes (600s) for production
    console.log(`⏱️ Timer duration set to: ${window.timerDuration} seconds ${debugTimer ? '(DEBUG MODE)' : ''}`);
}
if (typeof window.timerExpired === 'undefined') {
    window.timerExpired = false;
}

// Note: API configuration is loaded from config-unified.js file

// Avatar selection state
if (typeof window.selectedAvatar === 'undefined') {
    window.selectedAvatar = null; // Will store the avatar image path
}

$(document).ready(function() {
    // Initialize the dynamic interface
    initializeDynamicInterface();
});

function initializeDynamicInterface() {
    const avatarSelectionInterface = $('#avatarSelectionInterface');
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

    // Initialize avatar selection first
    initializeAvatarSelection();
    
    // Initialize system prompt configuration
    initializeSystemPromptConfig();
    
    // Initialize chat functionality
    initializeChatFunctionality();

    function initializeAvatarSelection() {
        const avatarGrid = $('.avatar-grid');
        const confirmAvatarBtn = $('#confirmAvatarBtn');
        
        // Check for debug mode - clear saved avatar to always show selection
        const urlParams = new URLSearchParams(window.location.search);
        const debugMode = urlParams.get('debug') === 'true';
        const skipSurvey = urlParams.get('skipSurvey') === 'true';
        
        if (debugMode) {
            console.log('🐛 Debug mode: Clearing saved avatar to show selection screen');
            localStorage.removeItem('selectedAvatar');
        }
        
        if (skipSurvey) {
            console.log('⏭️ Skip survey mode: Marking survey as completed');
            localStorage.setItem('preTaskSurveyCompleted', 'true');
        }
        
        // Check if avatar was already selected
        const savedAvatar = localStorage.getItem('selectedAvatar');
        if (savedAvatar) {
            window.selectedAvatar = savedAvatar;
            // Skip to system prompt interface
            $('#avatarSelectionInterface').hide();
            $('#systemPromptInterface').show();
            
            // Display avatar in system prompt header
            $('#selectedAvatarImage').attr('src', savedAvatar);
            $('#selectedAvatarDisplay').show();
            
            console.log('✅ Avatar already selected:', savedAvatar);
            return;
        }
        
        console.log('🎭 Initializing avatar selection with 12 avatars');
        console.log('📁 Avatar path example: Avatar/avatar-1.jpg');
        
        // Generate 12 avatar options
        const avatarCount = 12;
        let avatarHTML = '';
        
        for (let i = 1; i <= avatarCount; i++) {
            const avatarPath = `Avatar/avatar-${i}.jpg`;
            avatarHTML += `
                <div class="avatar-option" data-avatar="${avatarPath}">
                    <img src="${avatarPath}" alt="Avatar ${i}" 
                         onerror="console.error('❌ Failed to load avatar ${i} from:', this.src); this.style.border='2px solid red';"
                         onload="console.log('✅ Loaded avatar ${i}');" />
                    <div class="avatar-check">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
            `;
        }
        
        avatarGrid.html(avatarHTML);
        console.log('✅ Avatar HTML inserted into grid');
        
        // Handle avatar selection
        $('.avatar-option').on('click', async function() {
            // Remove selection from all avatars
            $('.avatar-option').css('border-color', 'transparent');
            $('.avatar-check').hide();
            
            // Select this avatar
            $(this).css('border-color', '#2196F3');
            $(this).find('.avatar-check').css('display', 'flex');
            
            // Store selected avatar
            const avatarPath = $(this).data('avatar');
            window.selectedAvatar = avatarPath;
            
            // Enable confirm button
            confirmAvatarBtn.prop('disabled', false);
            
            console.log('🎭 Avatar selected:', avatarPath);
        });
        
        // Confirm avatar selection
        confirmAvatarBtn.on('click', async function() {
            if (!window.selectedAvatar) {
                alert('Please select an avatar first.');
                return;
            }
            
            // Save to localStorage
            localStorage.setItem('selectedAvatar', window.selectedAvatar);
            
            // Log to Firebase
            const avatarLogPath = studyId + '/participantData/' + firebaseUserId + '/selectedAvatar';
            await writeRealtimeDatabase(avatarLogPath, {
                avatar: window.selectedAvatar,
                timestamp: new Date().toISOString()
            });
            console.log('✅ Avatar selection saved to Firebase');
            
            // Switch to system prompt configuration
            switchToSystemPromptConfig();
        });
    }

    function initializeSystemPromptConfig() {
        // Get the system prompt input
        const systemPromptInput = $('#systemPromptInput');

        // Initialize survey
        initializePreTaskSurvey();

        // Clear survey completion on page load (for testing/fresh start)
        localStorage.removeItem('preTaskSurveyCompleted');
        localStorage.removeItem('preTaskSurveyData');
        console.log('🔄 Survey data cleared on page load');

        // Always start with Check/Test Persona buttons hidden
        $('.persona-check-buttons').hide();
        
        // Check for debug mode - hide Test Persona button if not in debug mode
        const urlParams = new URLSearchParams(window.location.search);
        const debugMode = urlParams.get('debug') === 'true';
        if (!debugMode) {
            $('#testPersonaBtn').hide();
            console.log('🐛 Test Persona button hidden (not in debug mode)');
        } else {
            console.log('🐛 Debug mode active: Test Persona button available');
        }

        // Character counter functionality
        const MIN_CHAR_LENGTH = 200;
        const shortenPrompt = urlParams.get('shortenPrompt') === 'true';
        
        const updateCharacterCounter = function() {
            const currentLength = systemPromptInput.val().length;
            $('#charCount').text(currentLength);
            
            // Update color based on whether minimum is met (or bypassed)
            if (shortenPrompt || currentLength >= MIN_CHAR_LENGTH) {
                $('#characterCounter').css('color', 'var(--success-color, #28a745)');
                $('#submitPromptBtn').prop('disabled', false);
            } else {
                $('#characterCounter').css('color', 'var(--text-secondary)');
                $('#submitPromptBtn').prop('disabled', true);
            }
        };
        
        // Update counter text if bypass is enabled
        if (shortenPrompt) {
            $('#characterCounter').html('<span id="charCount">0</span> characters (minimum bypassed)');
            console.log('⏭️ Shortened prompt mode: Bypassing 200 character minimum');
        }
        
        // Initialize character counter on page load
        updateCharacterCounter();
        
        // Update character counter on input
        systemPromptInput.on('input', updateCharacterCounter);

        // Check if survey has been completed
        const surveyCompleted = localStorage.getItem('preTaskSurveyCompleted');
        console.log('🔍 Survey completion status on load:', surveyCompleted);
        
        if (!surveyCompleted) {
            // Disable all buttons except Submit Prompt
            disableInterfaceButtons();
            // Show initial placeholder (survey will show after Submit Prompt clicked)
            $('#initialPlaceholder').show();
            $('#preTaskSurveyContainer').hide();
            $('#personaVisualization').hide();
            // Explicitly hide Check/Test Persona buttons until survey is complete
            $('.persona-check-buttons').hide();
            console.log('🔒 Check/Test Persona buttons hidden (survey not completed)');
        } else {
            // Survey already completed
            $('#submitPromptBtn').hide(); // Hide Submit Prompt button
            $('#initialPlaceholder').show();
            $('#initialPlaceholder').html(`
                <div style="text-align: center; color: var(--text-muted); padding: 3rem 2rem;">
                    <i class="fas fa-chart-bar" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p style="margin: 0; font-size: 1.1rem;">Click "Test Persona" or "Check Persona" to analyze</p>
                </div>
            `);
            $('#preTaskSurveyContainer').hide();
            $('#personaVisualization').hide();
            // Show Check/Test Persona buttons
            $('.persona-check-buttons').show();
        }

        // Submit Prompt button - triggers survey
        $('#submitPromptBtn').on('click', function() {
            const systemPrompt = $('#systemPromptInput').val();
            
            if (!systemPrompt.trim()) {
                alert('Please enter a system prompt first.');
                return;
            }
            
            // Check minimum length unless bypassed
            if (!shortenPrompt && systemPrompt.length < MIN_CHAR_LENGTH) {
                alert(`Please enter at least ${MIN_CHAR_LENGTH} characters. Current length: ${systemPrompt.length}`);
                return;
            }
            
            // Check if survey was already completed OR if skipSurvey mode is on
            const surveyCompleted = localStorage.getItem('preTaskSurveyCompleted');
            const skipSurvey = urlParams.get('skipSurvey') === 'true';
            
            if (surveyCompleted || skipSurvey) {
                if (skipSurvey) {
                    console.log('⏭️ Skip survey mode: Bypassing survey');
                    localStorage.setItem('preTaskSurveyCompleted', 'true');
                } else {
                    console.log('⚠️ Survey already completed, skipping');
                }
                
                // Hide placeholder and Submit button, show Check/Test Persona buttons
                $('#initialPlaceholder').hide();
                $('#submitPromptBtn').hide();
                $('.persona-check-buttons').show();
                $('#initialPlaceholder').show();
                $('#initialPlaceholder').html(`
                    <div style="text-align: center; color: var(--text-muted); padding: 3rem 2rem;">
                        <i class="fas fa-chart-bar" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                        <p style="margin: 0; font-size: 1.1rem;">Click "Test Persona" or "Check Persona" to analyze</p>
                    </div>
                `);
                
                // Enable interface buttons
                enableInterfaceButtons();
                
                return;
            }
            
            // Hide placeholder and show survey
            $('#initialPlaceholder').hide();
            renderInlineSurvey();
            
            // Hide Submit Prompt button after clicking
            $('#submitPromptBtn').prop('disabled', true).hide();
            
            console.log('📝 System prompt submitted, showing survey');
        });

        // Reset configuration
        resetConfig.on('click', async function() {
            systemPromptInput.val('');
            updateCharacterCounter(); // Update the counter to show 0
            
            // Log this reset action to Firebase
            const promptLogPath = studyId + '/participantData/' + firebaseUserId + '/systemPromptLog/' + Date.now();
            await writeRealtimeDatabase(promptLogPath, {
                prompt: '',
                action: 'reset_to_empty',
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
                
                // Get selected avatar for welcome message
                const selectedAvatar = localStorage.getItem('selectedAvatar') || window.selectedAvatar;
                let avatarHtml;
                if (selectedAvatar) {
                    avatarHtml = `<img src="${selectedAvatar}" alt="AI Assistant" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`;
                } else {
                    avatarHtml = '<i class="fas fa-robot"></i>';
                }
                
                // Add welcome message back
                const welcomeMessage = `
                    <div class="message assistant-message" data-message-id="1">
                        <div class="message-avatar">
                            ${avatarHtml}
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
            
            // Start timer if not already started
            if (window.timerStartTime === null) {
                startTimer();
            }
            
            // Switch to chat interface
            switchToChat();
        });

        // Check Persona button - analyze persona with API
        $('#checkPersonaBtn').on('click', async function() {
            // Remove focus from button to return to default state
            $(this).blur();
            
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
            
            // Hide placeholder, show persona visualization area
            $('#initialPlaceholder').hide();
            $('#personaVisualization').show();
            
            // Call persona check
            checkPersona(systemPrompt);
        });

        // Test Persona button - generate mock data
        $('#testPersonaBtn').on('click', async function() {
            // Remove focus from button to return to default state
            $(this).blur();
            
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
            
            // Hide placeholder, show persona visualization area
            $('#initialPlaceholder').hide();
            $('#personaVisualization').show();
            
            // Generate test persona
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
        const senderName = sender === 'user' ? 'You' : 'Assistant';
        const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const timestamp = new Date().toISOString();
        
        // Get the current system prompt being used
        const currentSystemPrompt = localStorage.getItem('customSystemPrompt') || 
            "You are a helpful research assistant for the MIT Media Lab Chat Study. Provide thoughtful, informative responses to help participants with their research questions. Be conversational and engaging while maintaining a professional tone.";
        
        // Generate avatar HTML based on sender and selected avatar
        let avatarHtml;
        if (sender === 'user') {
            avatarHtml = '<i class="fas fa-user"></i>';
        } else {
            // Use selected avatar image for assistant
            const selectedAvatar = localStorage.getItem('selectedAvatar') || window.selectedAvatar;
            if (selectedAvatar) {
                avatarHtml = `<img src="${selectedAvatar}" alt="AI Assistant" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`;
            } else {
                avatarHtml = '<i class="fas fa-robot"></i>';
            }
        }
        
        const messageHtml = `
            <div class="message ${messageClass}" data-message-id="${messageId}">
                <div class="message-avatar">
                    ${avatarHtml}
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
        avatarSelectionInterface.hide();
        systemPromptInterface.hide();
        chatInterface.show();
        
        // Update initial message avatar with selected avatar
        const selectedAvatar = localStorage.getItem('selectedAvatar') || window.selectedAvatar;
        if (selectedAvatar) {
            const initialAvatarDiv = $('#initialMessageAvatar');
            if (initialAvatarDiv.length > 0) {
                initialAvatarDiv.html(`<img src="${selectedAvatar}" alt="AI Assistant" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`);
            }
        }
    }

    function switchToSystemPromptConfig() {
        avatarSelectionInterface.hide();
        chatInterface.hide();
        systemPromptInterface.show();
        
        // Display selected avatar in header
        const selectedAvatar = localStorage.getItem('selectedAvatar') || window.selectedAvatar;
        if (selectedAvatar) {
            $('#selectedAvatarImage').attr('src', selectedAvatar);
            $('#selectedAvatarDisplay').show();
            console.log('🎭 Displaying selected avatar in system prompt header:', selectedAvatar);
        }
    }

    // Add clear conversation function
    window.clearConversation = function() {
        window.conversationHistory = [];
        messagesContainer.empty();
        
        // Get selected avatar for welcome message
        const selectedAvatar = localStorage.getItem('selectedAvatar') || window.selectedAvatar;
        let avatarHtml;
        if (selectedAvatar) {
            avatarHtml = `<img src="${selectedAvatar}" alt="AI Assistant" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`;
        } else {
            avatarHtml = '<i class="fas fa-robot"></i>';
        }
        
        // Add welcome message back
        const welcomeMessage = `
            <div class="message assistant-message" data-message-id="1">
                <div class="message-avatar">
                    ${avatarHtml}
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
        console.log('📊 Created sunburst container, about to render...');
        
        // Create the sunburst visualization
        setTimeout(() => {
            console.log('⏰ Timeout fired, checking for createPersonaSunburst function...');
            console.log('Function exists?', typeof createPersonaSunburst === 'function');
            
            if (typeof createPersonaSunburst === 'function') {
                console.log('✅ Calling createPersonaSunburst with personaData:', personaData);
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

// Initialize pre-task survey (called on page load)
function initializePreTaskSurvey() {
    // This is now just a placeholder - actual event listeners are set up
    // in setupSurveyEventListeners() after HTML is inserted
    console.log('Survey initialization ready');
}

// Set up survey event listeners (called after HTML is inserted)
function setupSurveyEventListeners() {
    console.log('🔧 Setting up survey event listeners...');
    
    const phase1 = $('#surveyPhase1');
    const phase2 = $('#surveyPhase2');
    const phase3 = $('#surveyPhase3');
    
    const phase1ProceedBtn = $('#phase1ProceedBtn');
    const phase2ProceedBtn = $('#phase2ProceedBtn');
    const phase3ProceedBtn = $('#phase3ProceedBtn');
    
    console.log('Phase 1 button found:', phase1ProceedBtn.length > 0);
    console.log('Phase 2 button found:', phase2ProceedBtn.length > 0);
    console.log('Phase 3 button found:', phase3ProceedBtn.length > 0);
    
    // Phase 1: Listen to radio button changes
    $('input[name="phase1_q1"], input[name="phase1_q2"]').on('change', function() {
        const q1Answered = $('input[name="phase1_q1"]:checked').length > 0;
        const q2Answered = $('input[name="phase1_q2"]:checked').length > 0;
        const bothAnswered = q1Answered && q2Answered;
        console.log('Phase 1 validation - Q1:', q1Answered, 'Q2:', q2Answered, 'Both:', bothAnswered);
        phase1ProceedBtn.prop('disabled', !bothAnswered);
    });
    
    // Phase 1 Proceed button
    phase1ProceedBtn.on('click', async function() {
        console.log('Phase 1 Proceed clicked');
        
        // Save Phase 1 data to Firebase
        await savePhase1Data();
        
        phase1.hide();
        phase2.show();
    });
    
    // Phase 2: Listen to all trait radio buttons
    const traitNames = [
        'trait_empathy',
        'trait_sociality',
        'trait_supportiveness',
        'trait_humor',
        'trait_warmth',
        'trait_toxicity',
        'trait_sycophancy',
        'trait_deceptiveness',
        'trait_hallucination'
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
    phase2ProceedBtn.on('click', async function() {
        console.log('Phase 2 Proceed clicked');
        
        // Save Phase 2 data to Firebase
        await savePhase2Data();
        
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
        console.log('Phase 3 Proceed clicked');
        
        // Save Phase 3 data to Firebase
        await savePhase3Data();
        
        closePreTaskSurvey();
        
        // Survey complete - buttons are now enabled, user can proceed
        console.log('📝 Survey complete. User can now interact with the interface.');
    });
    
    console.log('✅ Survey event listeners set up successfully');
}

// Render survey inline in the right column
function renderInlineSurvey() {
    console.log('🔍 Attempting to render inline survey...');
    
    // Get survey phases from hidden source
    const surveySource = $('#surveyPhasesSource .survey-phases-wrapper');
    console.log('Survey source found:', surveySource.length > 0);
    
    if (surveySource.length > 0) {
        const surveyHTML = surveySource.html();
        console.log('Survey HTML length:', surveyHTML ? surveyHTML.length : 0);
        $('#surveyPhasesContainer').html(surveyHTML);
        
        // NOW set up event listeners after HTML is in place
        setupSurveyEventListeners();
    } else {
        console.error('❌ Survey source not found!');
    }
    
    // Show survey container
    $('#preTaskSurveyContainer').show();
    console.log('Survey container visibility:', $('#preTaskSurveyContainer').is(':visible'));
    
    // Reset to phase 1
    setTimeout(() => {
        $('#surveyPhase1').show();
        $('#surveyPhase2').hide();
        $('#surveyPhase3').hide();
        console.log('Phase 1 visible:', $('#surveyPhase1').is(':visible'));
    }, 100);
    
    console.log('📋 Pre-task survey displayed inline');
}

// Close/hide inline survey
function closePreTaskSurvey() {
    // Hide survey container
    $('#preTaskSurveyContainer').hide();
    
    // Show placeholder in persona area with instructions
    $('#personaVisualization').hide();
    $('#initialPlaceholder').show();
    $('#initialPlaceholder').html(`
        <div style="text-align: center; color: var(--text-muted); padding: 3rem 2rem;">
            <i class="fas fa-chart-bar" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
            <p style="margin: 0; font-size: 1.1rem;">Click "Test Persona" or "Check Persona" to analyze</p>
        </div>
    `);
    
    // Mark survey as completed
    localStorage.setItem('preTaskSurveyCompleted', 'true');
    
    // Enable interface buttons now that survey is complete
    enableInterfaceButtons();
    
    // Show Check Persona and Test Persona buttons
    $('.persona-check-buttons').show();
    
    console.log('✅ Pre-task survey completed and closed');
    console.log('👉 Check Persona and Test Persona buttons now available');
}

// Disable interface buttons (called before survey)
function disableInterfaceButtons() {
    $('#startChatBtn').prop('disabled', true);
    $('#resetConfig').prop('disabled', true);
    $('#checkPersonaBtn').prop('disabled', true);
    $('#testPersonaBtn').prop('disabled', true);
    // Keep Submit Prompt button enabled initially
    $('#submitPromptBtn').prop('disabled', false);
    console.log('🔒 Interface buttons disabled until survey completion');
}

// Enable interface buttons (called after survey)
function enableInterfaceButtons() {
    $('#startChatBtn').prop('disabled', false);
    $('#resetConfig').prop('disabled', false);
    $('#checkPersonaBtn').prop('disabled', false);
    $('#testPersonaBtn').prop('disabled', false);
    // Submit Prompt button already hidden/disabled after use
    console.log('🔓 Interface buttons enabled');
}

// Save Phase 1 data to Firebase
async function savePhase1Data() {
    try {
        const timestamp = new Date().toISOString();
        const systemPrompt = $('#systemPromptInput').val();
        
        // Collect Phase 1 responses
        const phase1Data = {
            "How well could you predict unintended behaviors from your system prompt?": parseInt($('input[name="phase1_q1"]:checked').val()),
            "How well could you predict negative unintended behaviors from your system prompt?": parseInt($('input[name="phase1_q2"]:checked').val())
        };
        
        console.log('📊 Phase 1 data collected:', phase1Data);
        
        // Save to Firebase
        const basePath = `${studyId}/participantData/${firebaseUserId}/preTaskSurvey`;
        await writeRealtimeDatabase(`${basePath}/phase1`, {
            responses: phase1Data,
            timestamp: timestamp
        });
        console.log('✅ Phase 1 data saved to Firebase');
        
        // Save metadata on first phase
        await writeRealtimeDatabase(`${basePath}/metadata`, {
            system_prompt: systemPrompt,
            start_timestamp: timestamp
        });
        console.log('✅ Survey metadata initialized');
        
    } catch (error) {
        console.error('❌ Error saving Phase 1 data:', error);
    }
}

// Save Phase 2 data to Firebase
async function savePhase2Data() {
    try {
        const timestamp = new Date().toISOString();
        
        // Collect Phase 2 responses (trait predictions)
        const phase2Data = {
            "Empathy": parseInt($('input[name="trait_empathy"]:checked').val()),
            "Sociality": parseInt($('input[name="trait_sociality"]:checked').val()),
            "Supportiveness": parseInt($('input[name="trait_supportiveness"]:checked').val()),
            "Humor": parseInt($('input[name="trait_humor"]:checked').val()),
            "Warmth": parseInt($('input[name="trait_warmth"]:checked').val()),
            "Toxicity": parseInt($('input[name="trait_toxicity"]:checked').val()),
            "Sycophancy": parseInt($('input[name="trait_sycophancy"]:checked').val()),
            "Deceptiveness": parseInt($('input[name="trait_deceptiveness"]:checked').val()),
            "Hallucination": parseInt($('input[name="trait_hallucination"]:checked').val())
        };
        
        console.log('📊 Phase 2 data collected:', phase2Data);
        
        // Save to Firebase
        const basePath = `${studyId}/participantData/${firebaseUserId}/preTaskSurvey`;
        await writeRealtimeDatabase(`${basePath}/phase2`, {
            responses: phase2Data,
            timestamp: timestamp
        });
        console.log('✅ Phase 2 data saved to Firebase');
        
    } catch (error) {
        console.error('❌ Error saving Phase 2 data:', error);
    }
}

// Save Phase 3 data to Firebase
async function savePhase3Data() {
    try {
        const timestamp = new Date().toISOString();
        
        // Collect Phase 3 response
        const phase3Data = {
            "Given the relevant background about unintended model behaviors, how much do you trust this model?": parseInt($('input[name="phase3_trust"]:checked').val())
        };
        
        console.log('📊 Phase 3 data collected:', phase3Data);
        
        // Save to Firebase
        const basePath = `${studyId}/participantData/${firebaseUserId}/preTaskSurvey`;
        await writeRealtimeDatabase(`${basePath}/phase3`, {
            responses: phase3Data,
            timestamp: timestamp
        });
        console.log('✅ Phase 3 data saved to Firebase');
        
        // Update metadata with completion time
        await writeRealtimeDatabase(`${basePath}/metadata/completion_timestamp`, timestamp);
        await writeRealtimeDatabase(`${basePath}/metadata/completion_time`, Date.now());
        console.log('✅ Survey completion metadata saved');
        
        // Mark survey as completed
        localStorage.setItem('preTaskSurveyCompleted', 'true');
        
    } catch (error) {
        console.error('❌ Error saving Phase 3 data:', error);
    }
}

// ============================================
// TIMER FUNCTIONS
// ============================================

// Start the timer
async function startTimer() {
    if (window.timerStartTime !== null) {
        console.log('⚠️ Timer already started');
        return;
    }
    
    window.timerStartTime = Date.now();
    const startTimeISO = new Date().toISOString();
    
    console.log(`⏱️ Timer started at ${startTimeISO} for ${window.timerDuration} seconds`);
    
    // Save timer start to Firebase
    const timerPath = studyId + '/participantData/' + firebaseUserId + '/timer';
    await writeRealtimeDatabase(timerPath + '/startTime', startTimeISO);
    await writeRealtimeDatabase(timerPath + '/duration', window.timerDuration);
    
    // Show timer display
    $('#timerDisplay').show();
    
    // Update timer every second
    window.timerInterval = setInterval(updateTimer, 1000);
    
    // Initial update
    updateTimer();
}

// Update timer display
function updateTimer() {
    if (window.timerStartTime === null || window.timerExpired) {
        return;
    }
    
    const elapsed = Math.floor((Date.now() - window.timerStartTime) / 1000);
    const remaining = Math.max(0, window.timerDuration - elapsed);
    
    // Format time as M:SS
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    $('#timerText').text(timeString);
    
    // Check if timer has expired
    if (remaining <= 0 && !window.timerExpired) {
        timerExpired();
    }
}

// Timer has expired
async function timerExpired() {
    window.timerExpired = true;
    
    // Stop the interval
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
        window.timerInterval = null;
    }
    
    console.log('⏰ Timer expired!');
    
    // Save timer end to Firebase
    const endTimeISO = new Date().toISOString();
    const timerPath = studyId + '/participantData/' + firebaseUserId + '/timer';
    await writeRealtimeDatabase(timerPath + '/endTime', endTimeISO);
    
    // Show post-survey modal
    showPostSurvey();
}

// ============================================
// POST-SURVEY FUNCTIONS
// ============================================

// Show post-survey modal
function showPostSurvey() {
    console.log('📋 Showing post-survey modal');
    
    // Disable chat interface
    $('#messageInput').prop('disabled', true);
    $('#sendBtn').prop('disabled', true);
    $('#attachBtn').prop('disabled', true);
    $('#imageBtn').prop('disabled', true);
    $('#backToConfigBtn').prop('disabled', true);
    
    // Show modal
    $('#postSurveyModal').fadeIn(300);
    
    // Initialize post-survey event listeners
    initializePostSurvey();
}

// Initialize post-survey event listeners
function initializePostSurvey() {
    console.log('🔧 Setting up post-survey event listeners');
    
    // Phase 1: Listen to radio button changes
    $('input[name="post_q1"], input[name="post_q2"], input[name="post_q3"]').on('change', function() {
        const q1Answered = $('input[name="post_q1"]:checked').length > 0;
        const q2Answered = $('input[name="post_q2"]:checked').length > 0;
        const q3Answered = $('input[name="post_q3"]:checked').length > 0;
        const allAnswered = q1Answered && q2Answered && q3Answered;
        $('#postPhase1ProceedBtn').prop('disabled', !allAnswered);
    });
    
    // Phase 1 Proceed button
    $('#postPhase1ProceedBtn').off('click').on('click', async function() {
        console.log('Post-survey Phase 1 Proceed clicked');
        await savePostPhase1Data();
        $('#postSurveyPhase1').hide();
        $('#postSurveyPhase2').show();
    });
    
    // Phase 2: Listen to textarea input
    $('#postOpenEndedResponse').on('input', function() {
        const hasText = $(this).val().trim().length > 0;
        $('#postPhase2SubmitBtn').prop('disabled', !hasText);
    });
    
    // Phase 2 Back button
    $('#postPhase2BackBtn').off('click').on('click', function() {
        $('#postSurveyPhase2').hide();
        $('#postSurveyPhase1').show();
    });
    
    // Phase 2 Submit button
    $('#postPhase2SubmitBtn').off('click').on('click', async function() {
        console.log('Post-survey Phase 2 Submit clicked');
        await savePostPhase2Data();
        completePostSurvey();
    });
}

// Save Phase 1 data from post-survey
async function savePostPhase1Data() {
    try {
        const timestamp = new Date().toISOString();
        
        const phase1Data = {
            "How well could you predict unintended behaviors from your system prompt?": parseInt($('input[name="post_q1"]:checked').val()),
            "How well could you predict negative unintended behaviors from your system prompt?": parseInt($('input[name="post_q2"]:checked').val()),
            "Given the {relevant background abt unintended model behaviors}, how much do you trust this model?": parseInt($('input[name="post_q3"]:checked').val())
        };
        
        console.log('📊 Post-survey Phase 1 data collected:', phase1Data);
        
        const basePath = `${studyId}/participantData/${firebaseUserId}/postTaskSurvey`;
        await writeRealtimeDatabase(`${basePath}/phase1`, {
            responses: phase1Data,
            timestamp: timestamp
        });
        console.log('✅ Post-survey Phase 1 data saved to Firebase');
        
    } catch (error) {
        console.error('❌ Error saving post-survey Phase 1 data:', error);
    }
}

// Save Phase 2 data from post-survey
async function savePostPhase2Data() {
    try {
        const timestamp = new Date().toISOString();
        
        const phase2Data = {
            "openEndedFeedback": $('#postOpenEndedResponse').val().trim()
        };
        
        console.log('📊 Post-survey Phase 2 data collected:', phase2Data);
        
        const basePath = `${studyId}/participantData/${firebaseUserId}/postTaskSurvey`;
        await writeRealtimeDatabase(`${basePath}/phase2`, {
            responses: phase2Data,
            timestamp: timestamp
        });
        
        // Update metadata with completion time
        await writeRealtimeDatabase(`${basePath}/metadata/completion_timestamp`, timestamp);
        await writeRealtimeDatabase(`${basePath}/metadata/completion_time`, Date.now());
        console.log('✅ Post-survey Phase 2 data saved to Firebase');
        
    } catch (error) {
        console.error('❌ Error saving post-survey Phase 2 data:', error);
    }
}

// Complete post-survey and redirect to completion page
function completePostSurvey() {
    console.log('✅ Post-survey completed, redirecting to completion page');
    
    // Hide modal
    $('#postSurveyModal').fadeOut(300);
    
    // Redirect to completion page after a short delay
    setTimeout(function() {
        // Load completion page into the main content area
        $('#task-main-content').load('html/complete.html');
        
        // Or redirect to completion page
        // window.location.href = 'html/complete.html';
    }, 500);
}
