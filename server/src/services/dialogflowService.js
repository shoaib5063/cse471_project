/**
 * Dialogflow Service
 * Handles communication with Google Dialogflow for chatbot responses
 */
const dialogflow = require('@google-cloud/dialogflow');
const { v4: uuidv4 } = require('uuid');

// Session client created lazily
let sessionClient = null;

const getSessionClient = () => {
    if (!sessionClient) {
        sessionClient = new dialogflow.SessionsClient();
    }
    return sessionClient;
};

/**
 * Send a message to Dialogflow and get a response
 * @param {string} message - User's message
 * @param {string} sessionId - Unique session ID for the conversation
 * @returns {Promise<string>} - Bot's response
 */
const detectIntent = async (message, sessionId = null) => {
    // Read env vars at runtime, not at module load time
    const projectId = process.env.DIALOGFLOW_PROJECT_ID;

    console.log('Dialogflow detectIntent called');
    console.log('Project ID:', projectId);
    console.log('Credentials path:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

    if (!projectId) {
        throw new Error('DIALOGFLOW_PROJECT_ID is not set in environment variables');
    }

    // Use provided session ID or generate a new one
    const currentSessionId = sessionId || uuidv4();
    const client = getSessionClient();
    const sessionPath = client.projectAgentSessionPath(projectId, currentSessionId);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: 'en-US',
            },
        },
    };

    try {
        const [response] = await client.detectIntent(request);
        const result = response.queryResult;

        return {
            fulfillmentText: result.fulfillmentText || "I'm not sure how to respond to that.",
            intent: result.intent?.displayName || 'Unknown',
            confidence: result.intentDetectionConfidence || 0,
            sessionId: currentSessionId,
        };
    } catch (error) {
        console.error('Dialogflow API Error:', error);
        throw error;
    }
};

module.exports = { detectIntent };
