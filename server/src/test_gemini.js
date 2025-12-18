const { generateResponse } = require('./services/geminiService');
require('dotenv').config();

async function test() {
    console.log("Testing Gemini Service...");
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("❌ GEMINI_API_KEY is missing in .env");
        return;
    }
    console.log(`Loaded Key: ${key.substring(0, 5)}...${key.substring(key.length - 4)}`);

    try {
        const response = await generateResponse("Hello, are you working?");
        console.log("✅ Response received:", response);
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

test();
