const express = require('express');
const router = express.Router();
const { submitHealthForm, getHealthProfile } = require('../controllers/healthController');

// Submit health form and get dietary suggestions
router.post('/:userId/health-form', submitHealthForm);

// Get user's health profile
router.get('/:userId/health-profile', getHealthProfile);

module.exports = router;
