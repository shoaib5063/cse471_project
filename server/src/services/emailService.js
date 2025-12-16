/**
 * Nodemailer integration for sending meal reminder emails
 * Uses standard SMTP (e.g., Gmail)
 */
const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set. Emails will not send.');
    // Return a dummy transporter or null to handle gracefully
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail', // easy setup for Gmail
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App Password, not login password
    },
  });
};

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
 * Send meal reminder via Nodemailer
 * @param {string} userEmail
 * @param {string} mealType
 * @param {string} mealName
 */
const sendMealReminderEmail = async (userEmail, mealType, mealName) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.error('❌ Cannot send email: Transporter not configured (missing env vars)');
    return;
  }

  try {
    const htmlContent = buildHtml(mealType, mealName);

    const info = await transporter.sendMail({
      from: `"MindfulMeals" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🍽️ Time for ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}!`,
      html: htmlContent,
    });

    console.log(`✅ Meal reminder email sent to ${userEmail}. MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Error sending meal reminder email via Nodemailer:', error);
    throw error;
  }
};

/**
 * Send question reply email via Nodemailer
 * @param {string} userEmail
 * @param {string} question
 * @param {string} answer
 */
const sendQuestionReplyEmail = async (userEmail, question, answer) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.error('❌ Cannot send email: Transporter not configured');
    return;
  }

  try {
    const htmlContent = `<!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { color: #16a34a; margin: 0; }
          .content { background-color: #fff; padding: 20px; border-radius: 6px; margin-bottom: 20px; }
          .question-box { background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #6b7280; }
          .answer-box { background-color: #ecfdf5; padding: 15px; border-radius: 4px; border-left: 4px solid #16a34a; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Expert Reply</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Our nutrition expert has answered your question!</p>
            
            <h3>Your Question:</h3>
            <div class="question-box">
              ${question}
            </div>

            <h3>Expert Answer:</h3>
            <div class="answer-box">
              ${answer}
            </div>
          </div>
          <div class="footer">
            <p>MindfulMeals - Nourish Body & Mind</p>
          </div>
        </div>
      </body>
    </html>`;

    const info = await transporter.sendMail({
      from: `"MindfulMeals Expert" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `✅ Answer to your health question`,
      html: htmlContent,
    });

    console.log(`✅ Question reply email sent to ${userEmail}. MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Error sending question reply email:', error);
    throw error;
  }
};

module.exports = { sendMealReminderEmail, sendQuestionReplyEmail };
