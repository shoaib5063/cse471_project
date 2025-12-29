const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, createUser } = require('../controllers/userController');

// Create new user (Sync with Firebase)
router.post('/', createUser);

// Get user profile
router.get('/:userId', getUserProfile);

// Update user profile
router.put('/:userId', updateUserProfile);

// Get user health metrics
router.get('/:userId/metrics', async (req, res) => {
  try {
    const { userId } = req.params;

    // TODO: Fetch metrics from database
    // const metrics = await HealthMetric.find({ userId }).sort({ date: -1 });

    res.json({
      success: true,
      data: [],
      message: 'Health metrics fetched successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add health metric
router.post('/:userId/metrics', async (req, res) => {
  try {
    const { userId } = req.params;
    const metricData = req.body;

    // TODO: Create metric in database
    // const metric = await HealthMetric.create({ userId, ...metricData });

    res.status(201).json({
      success: true,
      data: metricData,
      message: 'Health metric added successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
