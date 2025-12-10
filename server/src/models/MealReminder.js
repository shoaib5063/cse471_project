const mongoose = require('mongoose');

const mealReminderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true,
  },
  reminderTime: {
    type: String,
    required: true, // Format: "HH:mm" (24-hour)
  },
  mealName: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastSentAt: {
    type: Date,
    default: null,
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MealReminder', mealReminderSchema);
