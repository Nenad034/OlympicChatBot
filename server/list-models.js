
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        console.log('Listing available models...');
        // The SDK might not have a direct listModels, but we can try to find out
        // Or just try common names
        const models = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro',
            'gemini-1.0-pro',
            'models/gemini-1.5-flash',
            'models/gemini-1.5-pro',
            'models/gemini-pro',
            'models/gemini-flash-latest'
        ];

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                await model.generateContent('ping');
                console.log(`✅ ${modelName} is working!`);
                return; // Found one!
            } catch (err) {
                console.log(`❌ ${modelName}: ${err.status} ${err.statusText}`);
            }
        }
    } catch (error) {
        console.error('Fatal error:', error);
    }
}

listModels();
