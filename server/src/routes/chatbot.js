const express = require('express');
const router = express.Router();
const { detectIntent } = require('../services/dialogflowService');

/**
 * POST /api/chatbot/message
 * Send a message to the chatbot and get a response
 */
router.post('/message', async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message is required' });
        }

        const response = await detectIntent(message, sessionId);

        res.json({
            userMessage: message,
            botResponse: response.fulfillmentText,
            intent: response.intent,
            confidence: response.confidence,
            sessionId: response.sessionId,
        });
    } catch (error) {
        console.error('Chatbot error:', error.message);
        console.error('Full error:', JSON.stringify(error, null, 2));
        res.status(500).json({
            error: 'Failed to get response from chatbot',
            details: error.message,
        });
    }
});

module.exports = router;
