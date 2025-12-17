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
        res.status(500).json({
            error: 'Failed to get response from chatbot',
            details: error.message,
        });
    }
});

module.exports = router;
