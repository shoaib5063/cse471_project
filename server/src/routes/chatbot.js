const express = require('express');
const router = express.Router();
const { generateResponse } = require('../services/geminiService');

/**
 * POST /api/chatbot/message
 * Send a message to the chatbot and get a response
 */
router.post('/message', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message is required' });
        }

        const botResponse = await generateResponse(message, history || []);

        res.json({
            userMessage: message,
            botResponse: botResponse,
            // Gemini doesn't strictly have intents/confidence like Dialogflow, 
            // but we can return dummy values if frontend expects them
            intent: 'generative_response',
            confidence: 1.0,
        });
    } catch (error) {
        console.error('Chatbot error:', error.message);
        console.error('Full error details:', error);

        // Handle rate limit errors
        if (error.message && error.message.startsWith('RATE_LIMIT:')) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                details: error.message.replace('RATE_LIMIT: ', ''),
                botResponse: "I'm sorry, but I'm currently experiencing high demand. Please try again in a few minutes. In the meantime, feel free to explore the other features of MindfulMeals!",
            });
        }

        res.status(500).json({
            error: 'Failed to get response from chatbot',
            details: error.message,
        });
    }
});

module.exports = router;
