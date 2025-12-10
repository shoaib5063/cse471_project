const MealReminder = require('../models/MealReminder');
const { sendMealReminderEmail } = require('../services/emailService');

/**
 * Create a new meal reminder
 */
const createReminder = async (req, res) => {
  try {
    const { userId, mealType, reminderTime, mealName, email } = req.body;

    // Validate input
    if (!userId || !mealType || !reminderTime || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate time format (HH:mm)
    if (!/^\d{2}:\d{2}$/.test(reminderTime)) {
      return res.status(400).json({ error: 'Invalid time format. Use HH:mm' });
    }

    // Check if reminder already exists for this meal type
    const existingReminder = await MealReminder.findOne({ userId, mealType });
    if (existingReminder) {
      return res.status(400).json({ error: `Reminder for ${mealType} already exists` });
    }

    const reminder = new MealReminder({
      userId,
      mealType,
      reminderTime,
      mealName,
      email,
      isActive: true,
    });

    await reminder.save();
    res.status(201).json({ message: 'Reminder created successfully', reminder });
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
};

/**
 * Get all reminders for a user
 */
const getUserReminders = async (req, res) => {
  try {
    const { userId } = req.params;

    const reminders = await MealReminder.find({ userId });
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
};

/**
 * Get a specific reminder
 */
const getReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;

    const reminder = await MealReminder.findById(reminderId);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    console.error('Error fetching reminder:', error);
    res.status(500).json({ error: 'Failed to fetch reminder' });
  }
};

/**
 * Update a reminder
 */
const updateReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const { reminderTime, mealName, isActive, email } = req.body;

    const reminder = await MealReminder.findByIdAndUpdate(
      reminderId,
      {
        ...(reminderTime && { reminderTime }),
        ...(mealName !== undefined && { mealName }),
        ...(isActive !== undefined && { isActive }),
        ...(email && { email }),
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({ message: 'Reminder updated successfully', reminder });
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
};

/**
 * Delete a reminder
 */
const deleteReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;

    const reminder = await MealReminder.findByIdAndDelete(reminderId);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
};

/**
 * Toggle reminder active status
 */
const toggleReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;

    const reminder = await MealReminder.findById(reminderId);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    reminder.isActive = !reminder.isActive;
    reminder.updatedAt = new Date();
    await reminder.save();

    res.json({ message: 'Reminder updated successfully', reminder });
  } catch (error) {
    console.error('Error toggling reminder:', error);
    res.status(500).json({ error: 'Failed to toggle reminder' });
  }
};

module.exports = {
  createReminder,
  getUserReminders,
  getReminder,
  updateReminder,
  deleteReminder,
  toggleReminder,
  // Temporary test helper to trigger a send immediately
  testSendReminder,
};

/**
 * Temporary: Trigger a test send immediately (for debugging/testing only)
 * Expects { email, mealType, mealName } in the request body
 */
async function testSendReminder(req, res) {
  try {
    const { email, mealType, mealName } = req.body;

    if (!email || !mealType) {
      return res.status(400).json({ error: 'Missing required fields: email and mealType' });
    }

    await sendMealReminderEmail(email, mealType, mealName || 'Test meal');

    return res.json({ message: 'Test reminder email triggered' });
  } catch (error) {
    console.error('Error in testSendReminder:', error);
    return res.status(500).json({ error: 'Failed to send test reminder', details: error.message || error });
  }
}
