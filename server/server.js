// ===================================
// Olympic Travel ChatBot - Backend Server
// Google Gemini AI Integration
// ===================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { initializeAutoScraping, formatDataForAI } from './scraper.js';
import { formatKnowledgeBaseForAI } from './knowledgeBase.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===================================
// Security Middleware
// ===================================

// Helmet for security headers
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Body parser
app.use(express.json({ limit: '10kb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 20,
    message: 'Previše zahteva sa ove IP adrese. Molimo pokušajte kasnije.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// ===================================
// Google Gemini AI Configuration
// ===================================

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompt - Olympic Travel knowledge and behavior
const SYSTEM_PROMPT = `Ti si profesionalni prodajni agent turističke agencije Olympic Travel.
TVOJ CILj: Pruži konkretne, direktne i korisne informacije odmah.

STROGA PRAVILA KOMUNICIRANJA:
1. BUDI DIREKTAN: Ne troši reči na duge uvodne rečenice. Pređi odmah na stvar.
2. KORISTI PODATKE: Ako u bazi znanja vidiš hotele za traženu destinaciju, NABROJ IH ODMAH u listi.
3. BEZ IZGOVORA: Nikada ne govori "Nemam uvid u katalog" ili "Ja sam asistent".
4. KONCIZNOST: Odgovori treba da budu kratki i informativni.
5. STRUKTURA:
   - Direktno odgovori na pitanje sa konkretnim hotelima iz baze.
   - Za cene reci: "Cene zavise od termina. Pozovite nas na [icon-phone] +381 11 655 0 020 za tačnu ponudu."
   - Završi jednom kratkom rečenicom za kontakt.

PRAVILA ODGOVARANJA:
1. Uvek navedi specifična imena hotela iz baze.
2. Koristi prazne redove između logičkih celina.
3. Obavezno koristi ikone: [icon-beach], [icon-ski], [icon-plane], [icon-hotel], [icon-phone], [icon-location].`;

// ===================================
// AI Chat Function
// ===================================

async function generateAIResponse(userMessage, conversationHistory = []) {
    try {
        const model = genAI.getGenerativeModel({
            model: "models/gemini-flash-latest"
        });

        // Get stored knowledge and real-time data
        const staticKnowledge = formatKnowledgeBaseForAI();
        const scrapedData = formatDataForAI();

        // Build conversation context with combined information
        const chatHistory = [
            {
                role: 'user',
                parts: [{
                    text: 'Molim te pročitaj sledeća uputstva i bazu znanja, pa se ponašaj u skladu sa njima:\n\n' +
                        SYSTEM_PROMPT + '\n\n' +
                        '--- STATIČKA BAZA ZNANJA ---\n' + staticKnowledge + '\n\n' +
                        '--- AŽURNI PODACI SA SAJTA ---\n' + scrapedData
                }]
            },
            {
                role: 'model',
                parts: [{ text: 'Razumem! Ja sam virtuelni asistent za Olympic Travel. Imam uvid u kompletnu bazu znanja i najnovije podatke sa našeg sajta. Spreman sam da pomognem korisnicima profesionalno, ljubazno i na srpskom jeziku. Kako vam mogu pomoći?' }]
            }
        ];

        // Add conversation history
        conversationHistory.forEach(msg => {
            chatHistory.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        });

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
                topP: 0.8,
                topK: 40
            }
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

// ===================================
// API Routes
// ===================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Olympic Travel ChatBot API',
        timestamp: new Date().toISOString()
    });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        // Validation
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                error: 'Poruka je obavezna i mora biti tekst'
            });
        }

        if (message.length > 500) {
            return res.status(400).json({
                error: 'Poruka je predugačka (maksimalno 500 karaktera)'
            });
        }

        // Generate AI response
        const aiResponse = await generateAIResponse(message, history || []);

        res.json({
            success: true,
            response: aiResponse,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chat Error:', error);

        let fallbackMsg = 'Hvala na poruci! Za direktnu pomoć, kontaktirajte nas na +381 11 655 0 020 ili info@olympic.rs';

        // Handle specific AI quota errors
        if (error.status === 429) {
            fallbackMsg = 'Hvala na poruci! Trenutno imamo veliku gužvu (AI kvota popunjena). Molimo sačekajte minut-dva i pokušajte ponovo, ili nas pozovite direktno na +381 11 655 0 020.';
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Došlo je do greške. Molimo pokušajte ponovo.',
            fallbackResponse: fallbackMsg
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint nije pronađen' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: 'Interna greška servera',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ===================================
// Start Server
// ===================================

app.listen(PORT, () => {
    console.log('🚀 Olympic Travel ChatBot Server');
    console.log(`📡 Server running on port ${PORT} `);
    console.log(`🌍 Environment: ${process.env.NODE_ENV} `);
    console.log(`🤖 AI Model: Google Gemini 1.5 Flash`);
    console.log(`🔒 Security: Helmet + CORS + Rate Limiting`);
    console.log(`✅ Ready to serve requests!`);

    // Initialize web scraping
    console.log('\n🌐 Initializing Olympic Travel web scraper...');
    initializeAutoScraping();
});
