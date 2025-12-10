const SibApiV3Sdk = require('sib-api-v3-sdk');

// Configure Brevo API key
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Use the existing environment variable check or a default to be safe, relying on the one we just added
if (!process.env.BREVO_API_KEY) {
    console.warn('⚠️ BREVO_API_KEY is not set in environment variables. Brevo API calls will fail.');
}

const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.EmailCampaignsApi();

/**
 * Create an email campaign via Brevo API
 * @param {Object} campaignData - Object containing campaign details
 * @param {string} campaignData.name - Name of the campaign
 * @param {string} campaignData.subject - Subject of the email
 * @param {string} campaignData.senderName - Name of the sender
 * @param {string} campaignData.senderEmail - Email of the sender
 * @param {string} campaignData.htmlContent - HTML content of the email
 * @param {Array<number>} campaignData.listIds - Array of list IDs to send to
 * @param {string} [campaignData.scheduledAt] - Optional schedule time (UTC YYYY-MM-DD HH:mm:ss)
 * @returns {Promise<Object>} - The API response
 */
const createEmailCampaign = async (campaignData) => {
    try {
        const emailCampaigns = new SibApiV3Sdk.CreateEmailCampaign();
        
        emailCampaigns.name = campaignData.name;
        emailCampaigns.subject = campaignData.subject;
        emailCampaigns.sender = { 
            name: campaignData.senderName, 
            email: campaignData.senderEmail 
        };
        emailCampaigns.type = "classic";
        emailCampaigns.htmlContent = campaignData.htmlContent;
        emailCampaigns.recipients = { listIds: campaignData.listIds }; // Expecting array of integers
        
        if (campaignData.scheduledAt) {
            emailCampaigns.scheduledAt = campaignData.scheduledAt;
        }

        const data = await apiInstance.createEmailCampaign(emailCampaigns);
        console.log('✅ API called successfully. Returned data: ' + JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('❌ Error creating Brevo email campaign:');
        if (error && error.response && error.response.body) {
             console.error(JSON.stringify(error.response.body, null, 2));
        } else {
             console.error(error);
        }
        throw error;
    }
};

module.exports = { createEmailCampaign };
