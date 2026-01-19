// ===================================
// Olympic Travel Chatbot - JavaScript
// Security-First Implementation
// ===================================

// Security Configuration
const SECURITY_CONFIG = {
    MAX_MESSAGE_LENGTH: 500,
    MAX_MESSAGES_PER_MINUTE: 10,
    SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
    RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
    BLOCKED_PATTERNS: [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi, // Event handlers like onclick=
        /eval\(/gi,
        /expression\(/gi,
    ],
    PROMPT_INJECTION_PATTERNS: [
        /ignore\s+(previous|all|above)\s+instructions?/gi,
        /disregard\s+(previous|all|above)/gi,
        /forget\s+(previous|all|above)/gi,
        /system\s*:/gi,
        /you\s+are\s+now/gi,
        /new\s+instructions?/gi,
        /override/gi,
    ]
};

// State Management
let messageHistory = [];
let messageTimestamps = [];
let lastActivityTime = Date.now();
let sessionActive = true;
let isDragging = false;
let isResizing = false;
let dragOffset = { x: 0, y: 0 };
let resizeStart = { width: 0, height: 0, x: 0, y: 0 };

// DOM Elements
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotContainer = document.getElementById('chatbot-container');
const chatbotHeader = document.getElementById('chatbot-header');
const minimizeBtn = document.getElementById('minimize-btn');
const closeBtn = document.getElementById('close-btn');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotInput = document.getElementById('chatbot-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const charCount = document.getElementById('char-count');
const resizeHandle = document.getElementById('resize-handle');

// ===================================
// Security Functions
// ===================================

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
    if (!input || typeof input !== 'string') return '';

    // Remove script tags and dangerous patterns
    let sanitized = input;
    SECURITY_CONFIG.BLOCKED_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
    });

    // HTML escape
    const div = document.createElement('div');
    div.textContent = sanitized;
    sanitized = div.innerHTML;

    // Limit length
    sanitized = sanitized.substring(0, SECURITY_CONFIG.MAX_MESSAGE_LENGTH);

    return sanitized.trim();
}

/**
 * Detect prompt injection attempts
 * @param {string} input - User input to check
 * @returns {boolean} - True if injection detected
 */
function detectPromptInjection(input) {
    if (!input) return false;

    return SECURITY_CONFIG.PROMPT_INJECTION_PATTERNS.some(pattern =>
        pattern.test(input)
    );
}

/**
 * Check rate limiting
 * @returns {boolean} - True if rate limit exceeded
 */
function isRateLimited() {
    const now = Date.now();

    // Remove timestamps older than the rate limit window
    messageTimestamps = messageTimestamps.filter(
        timestamp => now - timestamp < SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS
    );

    return messageTimestamps.length >= SECURITY_CONFIG.MAX_MESSAGES_PER_MINUTE;
}

/**
 * Add message timestamp for rate limiting
 */
function addMessageTimestamp() {
    messageTimestamps.push(Date.now());
}

/**
 * Check session timeout
 */
function checkSessionTimeout() {
    const now = Date.now();
    if (now - lastActivityTime > SECURITY_CONFIG.SESSION_TIMEOUT_MS) {
        sessionActive = false;
        showSessionExpiredMessage();
    }
}

/**
 * Update last activity time
 */
function updateActivity() {
    lastActivityTime = Date.now();
    sessionActive = true;
}

/**
 * Show session expired message
 */
function showSessionExpiredMessage() {
    const expiredDiv = document.createElement('div');
    expiredDiv.className = 'rate-limit-warning';
    expiredDiv.innerHTML = '⏰ Sesija je istekla zbog neaktivnosti. Osvežite stranicu da nastavite.';
    chatbotMessages.appendChild(expiredDiv);
    chatbotInput.disabled = true;
    sendBtn.disabled = true;
}

/**
 * Show rate limit warning
 */
function showRateLimitWarning() {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'rate-limit-warning';
    warningDiv.innerHTML = '⚠️ Previše poruka u kratkom vremenu. Molimo sačekajte malo.';
    chatbotMessages.appendChild(warningDiv);

    setTimeout(() => {
        warningDiv.remove();
    }, 3000);
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `⚠️ ${message}`;
    chatbotMessages.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// ===================================
// Backend API Configuration
// ===================================

const API_BASE_URL = 'http://localhost:3000/api';

// ===================================
// AI Response Generator (Backend API)
// ===================================

/**
 * Generate AI response by calling backend API
 * @param {string} userMessage - Sanitized user message
 * @returns {Promise<string>} - AI response
 */
async function generateAIResponse(userMessage) {
    try {
        // Prepare conversation history (last 10 messages for context)
        const conversationHistory = messageHistory
            .slice(-10)
            .map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.message
            }));

        // Call backend API
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage,
                history: conversationHistory
            })
        });

        const data = await response.json();

        if (data.success && data.response) {
            return data.response;
        } else {
            // Use fallback response if API returns error
            return data.fallbackResponse || getFallbackResponse();
        }

    } catch (error) {
        console.error('API Error:', error);
        return getFallbackResponse();
    }
}

/**
 * Get fallback response when API is unavailable
 * @returns {string} - Fallback response
 */
function getFallbackResponse() {
    return `Hvala na poruci! [icon-sun]\n\n` +
        `Trenutno imam tehničkih poteškoća, ali možete nas kontaktirati direktno:\n\n` +
        `[icon-phone] **Beograd:** +381 11 655 0 020\n` +
        `[icon-phone] **Kragujevac:** +381 34 617 6 020\n` +
        `[icon-email] info@olympic.rs\n\n` +
        `Naš tim će vam rado pomoći!`;
}

/**
 * Replace icon markers with SVG icons
 * @param {string} text - Text with icon markers
 * @returns {string} - Text with SVG icons
 */
function replaceIconsWithSVG(text) {
    const icons = {
        'icon-beach': `<svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H22v-2h-4.5a1 1 0 0 1 0-2h5a1 1 0 0 0 1-1 12 12 0 0 0-12-12 12 12 0 0 0-12 12 1 1 0 0 0 1 1h5a1 1 0 0 1 0 2H2v2h4.5"/><path d="M12 2v20"/></svg>`,
        'icon-ski': `<svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="5" r="2"/><path d="m15 2 6 6-6 6"/><path d="M9 21 3 9l6-6 12 12-6 6z"/></svg>`,
        'icon-plane': `<svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,
        'icon-hotel': `<svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M6 4v17"/><path d="M18 4v17"/><path d="M6 4h12"/></svg>`,
        'icon-sun': `<svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
        'icon-mountain': `<svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`,
        'icon-phone': `<svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
        'icon-email': `<svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
        'icon-location': `<svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
    };

    let result = text;

    // Replace icon markers with SVG
    Object.keys(icons).forEach(iconKey => {
        const regex = new RegExp(`\\[${iconKey}\\]`, 'g');
        result = result.replace(regex, icons[iconKey]);
    });

    return result;
}

/**
 * Format text with proper line breaks and styling
 * @param {string} text - Text to format
 * @returns {string} - Formatted HTML
 */
function formatMessageText(text) {
    // Handle literal \n strings if sent by AI
    let formatted = text.replace(/\\n/g, '\n');

    // Replace double newlines with paragraph breaks
    formatted = formatted.replace(/\n\n/g, '</p><p>');

    // Replace single newlines with <br>
    formatted = formatted.replace(/\n/g, '<br>');

    // Wrap in paragraph tags
    formatted = `<p>${formatted}</p>`;

    // Bold text between **
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Replace icons
    formatted = replaceIconsWithSVG(formatted);

    return formatted;
}

// ===================================
// Message Handling
// ===================================

/**
 * Add message to chat
 * @param {string} message - Message content
 * @param {string} type - 'user' or 'bot'
 */
function addMessage(message, type = 'bot') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';

    if (type === 'bot') {
        avatarDiv.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="url(#msgGradient${Date.now()})"/>
                <path d="M12 6L15 9H13V15H11V9H9L12 6Z" fill="white"/>
                <defs>
                    <linearGradient id="msgGradient${Date.now()}" x1="0" y1="0" x2="24" y2="24">
                        <stop offset="0%" stop-color="#1F768E"/>
                        <stop offset="100%" stop-color="#981275"/>
                    </linearGradient>
                </defs>
            </svg>
        `;
    } else {
        avatarDiv.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#1A171F"/>
                <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" fill="white"/>
                <path d="M12 14C9.33 14 4 15.34 4 18V19H20V18C20 15.34 14.67 14 12 14Z" fill="white"/>
            </svg>
        `;
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // Format bot messages with proper spacing and icons
    if (type === 'bot') {
        contentDiv.innerHTML = formatMessageText(message);
    } else {
        contentDiv.innerHTML = message;
    }

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);

    chatbotMessages.appendChild(messageDiv);
    scrollToBottom();

    // Store in history (without HTML tags for security)
    messageHistory.push({
        type,
        message: message.replace(/<[^>]*>/g, ''),
        timestamp: Date.now()
    });
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    typingIndicator.classList.remove('hidden');
    scrollToBottom();
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
    typingIndicator.classList.add('hidden');
}

/**
 * Scroll to bottom of messages
 */
function scrollToBottom() {
    setTimeout(() => {
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }, 100);
}

/**
 * Handle sending message
 */
async function handleSendMessage() {
    // Check session timeout
    checkSessionTimeout();
    if (!sessionActive) return;

    const userMessage = chatbotInput.value.trim();

    // Validate input
    if (!userMessage) return;

    // Check rate limiting
    if (isRateLimited()) {
        showRateLimitWarning();
        return;
    }

    // Sanitize input
    const sanitizedMessage = sanitizeInput(userMessage);

    // Check for prompt injection
    if (detectPromptInjection(sanitizedMessage)) {
        showErrorMessage('Detektovan je pokušaj nebezbednog unosa. Molimo unesite validnu poruku.');
        chatbotInput.value = '';
        return;
    }

    // Add user message
    addMessage(sanitizedMessage, 'user');
    addMessageTimestamp();
    updateActivity();

    // Clear input
    chatbotInput.value = '';
    charCount.textContent = '0';

    // Show typing indicator
    showTypingIndicator();

    // Generate and show response (call real AI API)
    const response = await generateAIResponse(sanitizedMessage);
    hideTypingIndicator();
    addMessage(response, 'bot');
    updateActivity();
}

// ===================================
// Drag & Drop Functionality
// ===================================

chatbotHeader.addEventListener('mousedown', (e) => {
    if (e.target.closest('.control-btn')) return;

    isDragging = true;
    const rect = chatbotContainer.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;

    chatbotContainer.style.transition = 'none';
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;

    chatbotContainer.style.left = `${x}px`;
    chatbotContainer.style.top = `${y}px`;
    chatbotContainer.style.right = 'auto';
    chatbotContainer.style.bottom = 'auto';
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        chatbotContainer.style.transition = '';
    }
});

// ===================================
// Resize Functionality
// ===================================

resizeHandle.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    isResizing = true;

    const rect = chatbotContainer.getBoundingClientRect();
    resizeStart.width = rect.width;
    resizeStart.height = rect.height;
    resizeStart.x = e.clientX;
    resizeStart.y = e.clientY;

    chatbotContainer.style.transition = 'none';
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    const newWidth = Math.max(300, Math.min(600, resizeStart.width + deltaX));
    const newHeight = Math.max(400, Math.min(800, resizeStart.height + deltaY));

    chatbotContainer.style.width = `${newWidth}px`;
    chatbotContainer.style.height = `${newHeight}px`;
});

document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        chatbotContainer.style.transition = '';
    }
});

// ===================================
// UI Controls
// ===================================

chatbotToggle.addEventListener('click', () => {
    chatbotContainer.classList.remove('hidden');
    chatbotToggle.classList.add('hidden');
    updateActivity();
});

closeBtn.addEventListener('click', () => {
    chatbotContainer.classList.add('hidden');
    chatbotToggle.classList.remove('hidden');
});

minimizeBtn.addEventListener('click', () => {
    chatbotContainer.classList.toggle('minimized');
});

sendBtn.addEventListener('click', handleSendMessage);

chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});

chatbotInput.addEventListener('input', (e) => {
    const length = e.target.value.length;
    charCount.textContent = length;

    if (length >= SECURITY_CONFIG.MAX_MESSAGE_LENGTH) {
        charCount.style.color = '#ef4444';
    } else {
        charCount.style.color = '';
    }

    updateActivity();
});

// ===================================
// Session Management
// ===================================

// Check session timeout every minute
setInterval(checkSessionTimeout, 60000);

// Update activity on any interaction
document.addEventListener('click', updateActivity);
document.addEventListener('keypress', updateActivity);

// ===================================
// Initialize
// ===================================

console.log('🔒 Olympic Travel Chatbot initialized with security features');
console.log('✅ XSS Protection: Enabled');
console.log('✅ Rate Limiting: Enabled');
console.log('✅ Prompt Injection Prevention: Enabled');
console.log('✅ Session Timeout: 30 minutes');
