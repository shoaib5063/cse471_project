require('dotenv').config(); // Load FIRST
const { generateResponse } = require('./services/geminiService');

async function testConversation() {
    console.log("Testing Gemini Service (Correctly Loaded)...");

    try {
        console.log("Turn 1: User says 'Hello'");
        const response1 = await generateResponse("Hello");
        console.log("✅ Bot:", response1);

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
