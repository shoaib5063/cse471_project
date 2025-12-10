require('dotenv').config();
const { createEmailCampaign } = require('../services/brevoService');

const runTest = async () => {
    console.log('🚀 Starting Brevo Campaign Test...');

    // Test data based on user example
    const campaignData = {
        name: "Test Campaign via API " + new Date().toISOString(),
        subject: "Test Subject from MindfulMeals",
        senderName: process.env.BREVO_FROM_NAME || "MindfulMeals Team",
        senderEmail: process.env.BREVO_FROM_EMAIL || "test@example.com",
        htmlContent: '<h1>Hello!</h1><p>This is a test campaign created via the MindfulMeals Brevo Integration.</p>',
        listIds: [2] // Using ID 2 as per user example. This might fail if list 2 doesn't exist.
    };

    try {
        const result = await createEmailCampaign(campaignData);
        console.log('✨ Test passed! Campaign created.');
        console.log('Result:', result);
    } catch (error) {
        console.error('💥 Test failed!');
        // Error details are already logged in service
    }
};

runTest();
