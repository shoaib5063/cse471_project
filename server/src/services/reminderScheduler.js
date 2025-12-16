const cron = require('node-cron');
const MealReminder = require('../models/MealReminder');
const { sendMealReminderEmail } = require('./emailService');

let scheduledTasks = new Map(); // Store references to scheduled tasks

/**
 * Check if it's time to send reminder based on current time
 * @param {string} reminderTime - Time in "HH:mm" format
 * @returns {boolean}
 */
const isTimeToSendReminder = (reminderTime) => {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return currentTime === reminderTime;
};

/**
 * Check all active reminders and send emails if it's the right time
 */
const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    console.log(`⏰ Checking reminders at ${currentTime}...`);

    // Get all active reminders
    const reminders = await MealReminder.find({ isActive: true });

    for (const reminder of reminders) {
      // Check if it's time to send this reminder
      if (isTimeToSendReminder(reminder.reminderTime)) {
        // Check if we haven't already sent it today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastSent = reminder.lastSentAt ? new Date(reminder.lastSentAt) : null;
        const lastSentDate = lastSent ? new Date(lastSent) : null;
        lastSentDate?.setHours(0, 0, 0, 0);

        if (!lastSentDate || lastSentDate.getTime() !== today.getTime()) {
          // Send email
          try {
            await sendMealReminderEmail(reminder.email, reminder.mealType, reminder.mealName);

            // Update lastSentAt
            reminder.lastSentAt = new Date();
            await reminder.save();

            console.log(`✅ Reminder sent for ${reminder.mealType} to user ${reminder.userId} (${reminder.email})`);
          } catch (error) {
            console.error(`❌ Failed to send reminder for ${reminder.mealType}:`, error.message);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error checking reminders:', error);
  }
};

/**
 * Start the reminder scheduler
 * Runs every minute to check for active reminders
 */
const startReminderScheduler = () => {
  console.log('🔔 Starting meal reminder scheduler...');

  // Run the check every minute
  const task = cron.schedule('* * * * *', () => {
    checkAndSendReminders();
  });

  scheduledTasks.set('mealReminder', task);
  console.log('✅ Meal reminder scheduler started (checks every minute)');
};

/**
 * Stop the reminder scheduler
 */
const stopReminderScheduler = () => {
  const task = scheduledTasks.get('mealReminder');
  if (task) {
    task.stop();
    scheduledTasks.delete('mealReminder');
    console.log('⏹️ Meal reminder scheduler stopped');
  }
};

module.exports = { startReminderScheduler, stopReminderScheduler, checkAndSendReminders };
