const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const SYSTEM_PROMPT = `
You are a helpful, knowledgeable, and empathetic AI Health Assistant for the MindfulMeals application.
Your goal is to assist users with nutrition, healthy eating habits, meal planning, and general wellness.

    Guidelines:
1. ** Be Encouraging:** Always provide positive reinforcement and encouragement.
2. ** Be Informative:** Provide accurate, science - backed nutrition information(but verify you are not a doctor).
3. ** Be Safe:** If a user asks for medical advice(e.g., diagnosing a condition), politely decline and advise them to consult a healthcare professional.
4. ** Context:** You are part of an app that tracks meals, hydration, and sets calorie goals. 
5. ** Tone:** Friendly, professional, and supportive.
6. ** Brevity:** Keep answers concise and easy to read.Use bullet points where appropriate.

If you don't know the answer, admit it and suggest where they might find the information.
    `;

const generateResponse = async (userMessage, history = []) => {
    try {
        // Construct the chat history for the model
        // Note: Gemini history format is { role: "user" | "model", parts: [{ text: "..." }] }
        const chatHistory = history.map(msg => ({
            role: msg.role === 'bot' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        // Start a chat session
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: SYSTEM_PROMPT }]
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am ready to act as the MindfulMeals Health Assistant." }]
                },
                ...chatHistory
            ],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = response.text();
        console.log("Gemini Response generated successfully");
        return text;
    } catch (error) {
        console.error("Error generating Gemini response:", error);
        // Log additional details if available
        if (error.response) {
            console.error("Gemini API Error Response:", JSON.stringify(error.response, null, 2));
        }
        throw new Error("Failed to generate response from AI.");
    }
};

module.exports = { generateResponse };
