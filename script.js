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
// Olympic Travel Knowledge Base
// ===================================

const OLYMPIC_KNOWLEDGE = {
    destinations: {
        summer: {
            greece: "Grčka - Najpopularnija destinacija za letovanje! Nudimo aranžmane za Tasos, Halkidiki, Krit, Rodos, Krf i druge prelepе destinacije. Kristalno čisto more, prelepe plaže i bogata istorija.",
            turkey: "Turska - Odlična kombinacija plaže i sadržaja! Antalija, Belek, Side, Alanja - sve sa all-inclusive ponudama i vrhunskim hotelima.",
            egypt: "Egipat - Crveno more i piramide! Hurghada i Sharm El Sheikh nude fantastičan podvodni svet i luksuzne resortе.",
            tunisia: "Tunis - Egzotična destinacija sa prelepim peskušama i orijentalnim šarmom.",
            croatia: "Hrvatska - Naša najlепša suseda! Dalmacija, Istra, Kvarner - kristalno čisto more i bogata kulturna baština.",
            montenegro: "Crna Gora - Perla Jadrana! Budva, Bečići, Sveti Stefan - prelepe plaže i mediteranski ambijent.",
            albania: "Albanija - Skriveni dragulj Jadrana! Povoljne cene i netaknuta priroda.",
            bulgaria: "Bugarska - Sunčev breg i Zlatni pijasci - odličan izbor za porodice sa decom."
        },
        winter: {
            serbia: "Srbija - Kopaonik, Zlatibor, Stara Planina - naše najlepše planine sa odličnim ski stazama!",
            bulgaria: "Bugarska - Bansko i Borovets - povoljno zimovanje sa kvalitetnim stazama.",
            austria: "Austrija - Alpi na vrhunskom nivou! Innsbruck, Sölden, Ischgl - za prave ljubitelje skijanja.",
            italy: "Italija - Dolomiti i Alpi sa italijanskim šarmom. Cortina d'Ampezzo i Val Gardena.",
            france: "Francuska - Alpi - Chamonix, Val d'Isère - najpoznatija ski odmarališta na svetu!",
            slovenia: "Slovenija - Kranjska Gora i Vogel - blizu i pristupačno.",
            bosnia: "Bosna i Hercegovina - Jahorina i Bjelašnica - odličan kvalitet po povoljnim cenama."
        }
    },
    contact: {
        belgrade: {
            address: "Makedonska 30, Beograd",
            phones: ["+381 11 655 0 020", "+381 11 655 0 040", "+381 11 655 7 289", "+381 11 655 7 297"],
            email: "info@olympic.rs"
        },
        kragujevac: {
            address: "Karađorđeva 20, Kragujevac",
            phones: ["+381 34 617 6 020"],
            email: "info@olympic.rs"
        }
    },
    services: [
        "Letovanje 2026 - Grčka, Turska, Egipat, Tunis, Hrvatska, Crna Gora, Albanija, Bugarska",
        "Zimovanje 2026 - Srbija, Bugarska, Austrija, Italija, Francuska, Slovenija, BiH",
        "Avio karte - Povoljne cene za sve destinacije",
        "Wellness & Spa - Opuštajući odmor u spa centrima",
        "Nova Godina 2026 - Specijalne ponude za doček Nove godine",
        "Organizovana putovanja - Grupna putovanja sa vodičem"
    ]
};

// ===================================
// AI Response Generator
// ===================================

/**
 * Generate AI response based on user input
 * @param {string} userMessage - Sanitized user message
 * @returns {string} - AI response
 */
function generateAIResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Greeting responses
    if (lowerMessage.match(/\b(zdravo|cao|dobar dan|dobro vece|bok|hej|hello|hi)\b/)) {
        return "Zdravo! 👋 Dobrodošli u Olympic Travel. Kako vam mogu pomoći danas? Možete me pitati o letovanju, zimovanju, avio kartama ili našim kontakt informacijama.";
    }
    
    // Summer destinations
    if (lowerMessage.includes('letovanje') || lowerMessage.includes('leto') || lowerMessage.includes('more') || lowerMessage.includes('plaža')) {
        let response = "🏖️ <strong>Letovanje 2026</strong><br><br>Nudimo fantastične destinacije:<br><br>";
        
        if (lowerMessage.includes('grčka') || lowerMessage.includes('grcka') || lowerMessage.includes('greece')) {
            response += `📍 ${OLYMPIC_KNOWLEDGE.destinations.summer.greece}<br><br>`;
        } else if (lowerMessage.includes('turska') || lowerMessage.includes('turkey')) {
            response += `📍 ${OLYMPIC_KNOWLEDGE.destinations.summer.turkey}<br><br>`;
        } else if (lowerMessage.includes('egipat') || lowerMessage.includes('egypt')) {
            response += `📍 ${OLYMPIC_KNOWLEDGE.destinations.summer.egypt}<br><br>`;
        } else if (lowerMessage.includes('hrvatska') || lowerMessage.includes('croatia')) {
            response += `📍 ${OLYMPIC_KNOWLEDGE.destinations.summer.croatia}<br><br>`;
        } else {
            response += "📍 <strong>Grčka</strong> - Tasos, Halkidiki, Krit, Rodos<br>";
            response += "📍 <strong>Turska</strong> - Antalija, Belek, Side, Alanja<br>";
            response += "📍 <strong>Egipat</strong> - Hurghada, Sharm El Sheikh<br>";
            response += "📍 <strong>Hrvatska</strong> - Dalmacija, Istra, Kvarner<br>";
            response += "📍 <strong>Crna Gora</strong> - Budva, Bečići<br>";
            response += "📍 <strong>Tunis, Albanija, Bugarska</strong><br><br>";
        }
        
        response += "Za detaljnije informacije i rezervacije, kontaktirajte nas!";
        return response;
    }
    
    // Winter destinations
    if (lowerMessage.includes('zimovanje') || lowerMessage.includes('zima') || lowerMessage.includes('ski') || lowerMessage.includes('skijanje')) {
        let response = "⛷️ <strong>Zimovanje 2026</strong><br><br>Najbolje ski destinacije:<br><br>";
        
        if (lowerMessage.includes('kopaonik') || lowerMessage.includes('srbija') || lowerMessage.includes('serbia')) {
            response += `📍 ${OLYMPIC_KNOWLEDGE.destinations.winter.serbia}<br><br>`;
        } else if (lowerMessage.includes('austrija') || lowerMessage.includes('austria')) {
            response += `📍 ${OLYMPIC_KNOWLEDGE.destinations.winter.austria}<br><br>`;
        } else if (lowerMessage.includes('italija') || lowerMessage.includes('italy')) {
            response += `📍 ${OLYMPIC_KNOWLEDGE.destinations.winter.italy}<br><br>`;
        } else {
            response += "📍 <strong>Srbija</strong> - Kopaonik, Zlatibor, Stara Planina<br>";
            response += "📍 <strong>Bugarska</strong> - Bansko, Borovets<br>";
            response += "📍 <strong>Austrija</strong> - Innsbruck, Sölden<br>";
            response += "📍 <strong>Italija</strong> - Dolomiti<br>";
            response += "📍 <strong>Francuska</strong> - Chamonix, Val d'Isère<br>";
            response += "📍 <strong>Slovenija, BiH</strong><br><br>";
        }
        
        response += "Kontaktirajte nas za najbolje ponude!";
        return response;
    }
    
    // Contact information
    if (lowerMessage.includes('kontakt') || lowerMessage.includes('telefon') || lowerMessage.includes('adresa') || lowerMessage.includes('email') || lowerMessage.includes('gde ste')) {
        return `📞 <strong>Kontakt informacije</strong><br><br>` +
               `<strong>Beograd:</strong><br>` +
               `📍 ${OLYMPIC_KNOWLEDGE.contact.belgrade.address}<br>` +
               `☎️ ${OLYMPIC_KNOWLEDGE.contact.belgrade.phones.join(', ')}<br><br>` +
               `<strong>Kragujevac:</strong><br>` +
               `📍 ${OLYMPIC_KNOWLEDGE.contact.kragujevac.address}<br>` +
               `☎️ ${OLYMPIC_KNOWLEDGE.contact.kragujevac.phones[0]}<br><br>` +
               `📧 ${OLYMPIC_KNOWLEDGE.contact.belgrade.email}`;
    }
    
    // Avio karte
    if (lowerMessage.includes('avio') || lowerMessage.includes('avion') || lowerMessage.includes('let') || lowerMessage.includes('karta')) {
        return "✈️ <strong>Avio karte</strong><br><br>Nudimo povoljne avio karte za sve destinacije širom sveta! Kontaktirajte nas za najbolje ponude i cene.<br><br>📞 Pozovite nas ili pošaljite email za više informacija.";
    }
    
    // Wellness & Spa
    if (lowerMessage.includes('wellness') || lowerMessage.includes('spa') || lowerMessage.includes('relax')) {
        return "🧖 <strong>Wellness & Spa</strong><br><br>Opustite se u našim spa centrima! Nudimo pakete za wellness vikende i duže boravke sa tretmanima, masažama i opuštajućim sadržajima.<br><br>Kontaktirajte nas za detaljne ponude!";
    }
    
    // Prices
    if (lowerMessage.includes('cena') || lowerMessage.includes('cene') || lowerMessage.includes('koliko kosta') || lowerMessage.includes('price')) {
        return "💰 <strong>Cene</strong><br><br>Cene zavise od destinacije, perioda, tipa smeštaja i broja osoba. Za najtačnije informacije i najbolje ponude, molimo vas da nas kontaktirate:<br><br>📞 Beograd: +381 11 655 0 020<br>📞 Kragujevac: +381 34 617 6 020<br>📧 info@olympic.rs";
    }
    
    // Thank you
    if (lowerMessage.match(/\b(hvala|thanks|thank you|thx)\b/)) {
        return "Nema na čemu! 😊 Ako imate još pitanja, slobodno pitajte. Tu smo da vam pomognemo!";
    }
    
    // Goodbye
    if (lowerMessage.match(/\b(doviđenja|cao|zbogom|bye|goodbye)\b/)) {
        return "Doviđenja! 👋 Hvala što ste kontaktirali Olympic Travel. Radujemo se vašoj poseti!";
    }
    
    // Default response
    return "Hvala na poruci! 😊<br><br>Mogu vam pomoći sa informacijama o:<br>" +
           "🏖️ Letovanju 2026<br>" +
           "⛷️ Zimovanju 2026<br>" +
           "✈️ Avio kartama<br>" +
           "🧖 Wellness & Spa<br>" +
           "📞 Kontakt informacijama<br><br>" +
           "Šta vas interesuje?";
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
    contentDiv.innerHTML = message;
    
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
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
    
    // Generate and show response
    const response = generateAIResponse(sanitizedMessage);
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
