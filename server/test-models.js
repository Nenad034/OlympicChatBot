// Test script to list available Gemini models
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );

        const data = await response.json();

        if (data.models) {
            console.log('\n📋 Available Gemini Models:\n');
            data.models.forEach(model => {
                console.log(`✅ ${model.name}`);
                console.log(`   Display Name: ${model.displayName}`);
                console.log(`   Supported: ${model.supportedGenerationMethods?.join(', ')}\n`);
            });
        } else {
            console.log('Error:', data);
        }
    } catch (error) {
        console.error('Error fetching models:', error.message);
    }
}

listModels();
