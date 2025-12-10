const express = require('express');
const {
  createReminder,
  getUserReminders,
  getReminder,
  updateReminder,
  deleteReminder,
  toggleReminder,
  testSendReminder,
} = require('../controllers/reminderController');

const router = express.Router();

// Create a new reminder
router.post('/', createReminder);

// Temporary test endpoint to trigger email send immediately
router.post('/test-send', testSendReminder);

// Get all reminders for a user
router.get('/user/:userId', getUserReminders);

// Get a specific reminder
router.get('/:reminderId', getReminder);

// Update a reminder
router.put('/:reminderId', updateReminder);

// Delete a reminder
router.delete('/:reminderId', deleteReminder);

// Toggle reminder active status
router.patch('/:reminderId/toggle', toggleReminder);

module.exports = router;
