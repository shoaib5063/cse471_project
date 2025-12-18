const { generateResponse } = require('./services/geminiService');
require('dotenv').config();

async function testConversation() {
    console.log("Testing Gemini Service with History...");

    // 1. First msg
    try {
        console.log("Turn 1: User says 'Hello'");
        const response1 = await generateResponse("Hello");
        console.log("✅ Bot:", response1);

        // 2. Second msg with history
        console.log("\nTurn 2: User says 'What is my name?' (Simulate history)");
        const history = [
            { role: 'user', text: 'Hello' },
            { role: 'bot', text: response1 }
        ];
        const response2 = await generateResponse("What is my name?", history);
        console.log("✅ Bot:", response2);

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

testConversation();
