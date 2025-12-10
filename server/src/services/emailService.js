/**
 * Brevo (Sendinblue) / Sib API integration for sending meal reminder emails
 * Uses the official `sib-api-v3-sdk` package
 */
const SibApiV3Sdk = require('sib-api-v3-sdk');

// Configure Brevo API key
const defaultClient = SibApiV3Sdk.ApiClient.instance;
if (!process.env.BREVO_API_KEY) {
  console.error('❌ BREVO_API_KEY is not set. Set BREVO_API_KEY in your environment.');
}
if (defaultClient && defaultClient.authentications && defaultClient.authentications['api-key']) {
  defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY || '';
}

const transactionalApi = new SibApiV3Sdk.TransactionalEmailsApi();

const buildHtml = (mealType, mealName) => {
  return `<!DOCTYPE html>
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { color: #16a34a; margin: 0; }
        .content { background-color: #fff; padding: 20px; border-radius: 6px; margin-bottom: 20px; }
        .meal-info { background-color: #ecfdf5; padding: 15px; border-left: 4px solid #16a34a; border-radius: 4px; margin: 15px 0; }
        .meal-info p { margin: 5px 0; }
        .cta-button { display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍽️ MindfulMeals Reminder</h1>
        </div>
        <div class="content">
          <p>Hi there!</p>
          <p>It's time for your <strong>${mealType.toUpperCase()}</strong>!</p>
          <div class="meal-info">
            <p><strong>Meal:</strong> ${mealName || 'Enjoy your meal'}</p>
            <p><strong>Type:</strong> ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}</p>
            <p>Take a moment to nourish your body and mind.</p>
          </div>
          <p>Remember to:</p>
          <ul>
            <li>Eat mindfully and without distractions</li>
            <li>Chew slowly and enjoy your food</li>
            <li>Log your meal in MindfulMeals for tracking</li>
          </ul>
          <a href="${process.env.APP_URL || 'https://mindfulmeals.com'}/dashboard" class="cta-button">Log Your Meal</a>
        </div>
        <div class="footer">
          <p>You're receiving this because you set a reminder in MindfulMeals.</p>
          <p>Manage your reminders in your account settings.</p>
        </div>
      </div>
    </body>
  </html>`;
};

/**
 * Send meal reminder via Brevo (Sendinblue)
 * @param {string} userEmail
 * @param {string} mealType
 * @param {string} mealName
 */
const sendMealReminderEmail = async (userEmail, mealType, mealName) => {
  try {
    const sender = {
      name: process.env.BREVO_FROM_NAME || 'MindfulMeals',
      email: process.env.BREVO_FROM_EMAIL || 'noreply@mindfulmeals.com',
    };

    const to = [{ email: userEmail }];

    const htmlContent = buildHtml(mealType, mealName);

    const sendSmtpEmail = {
      sender,
      to,
      subject: `🍽️ Time for ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}!`,
      htmlContent,
    };

    const response = await transactionalApi.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Meal reminder email sent to ${userEmail}`);
    return response;
  } catch (error) {
    // Improve error logging to surface Brevo SDK details
    console.error('❌ Error sending meal reminder email via Brevo:');
    if (error && error.response) {
      try {
        console.error('Brevo response status:', error.status || error.response.status);
        console.error('Brevo response body:', JSON.stringify(error.response, null, 2));
      } catch (e) {
        console.error('Brevo error (could not stringify):', error.response);
      }
    } else if (error && error.body) {
      console.error('Brevo error body:', error.body);
    } else {
      console.error(error);
    }

    // Provide a clearer error message for common auth issues
    if (String(error).toLowerCase().includes('unauthorized') || String(error).toLowerCase().includes('401')) {
      throw new Error('Brevo Unauthorized: check BREVO_API_KEY and that the sender email is verified in your Brevo account.');
    }

    throw error;
  }
};

module.exports = { sendMealReminderEmail };
