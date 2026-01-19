
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { formatKnowledgeBaseForAI } from './knowledgeBase.js';
import { formatDataForAI } from './scraper.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
    console.log('Testing Gemini API...');
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash"
        });

        const staticKnowledge = formatKnowledgeBaseForAI();
        const scrapedData = formatDataForAI();

        const SYSTEM_PROMPT = `Ti si profesionalni prodajni agent turističke agencije Olympic Travel.
        TVOJ CILj: Pruži konkretne, direktne i korisne informacije odmah.`;

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
                parts: [{ text: 'Razumem!' }]
            }
        ];

        const chat = model.startChat({
            history: chatHistory,
        });

        const userMessage = 'interesu u me hoteli u Petrovcu na moru. Koje hotele imate u ponudi';
        console.log('Sending message:', userMessage);

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        console.log('Response:', response.text());
    } catch (error) {
        console.error('Error details:', error);
    }
}

testGemini();
