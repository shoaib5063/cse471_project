const Challenge = require('../models/Challenge');
const UserChallenge = require('../models/UserChallenge');
const Meal = require('../models/Meal');

// Get all active challenges
exports.getActiveChallenges = async (req, res) => {
  try {
    const today = new Date();
    const challenges = await Challenge.find({
      isActive: true,
      endDate: { $gte: today }
    }).sort({ startDate: 1 });

    res.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user's joined challenges with progress
exports.getUserChallenges = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userChallenges = await UserChallenge.find({ userId })
      .populate('challengeId')
      .sort({ joinedAt: -1 });

    // Trigger progress update for active challenges
    // In a real app, this might be too heavy to do on every fetch, 
    // but for this scale it ensures data is fresh.
    for (let uc of userChallenges) {
      if (uc.status === 'active' && uc.challengeId) {
        await calculateProgress(uc, userId);
      }
    }

    res.json(userChallenges);
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Join a challenge
exports.joinChallenge = async (req, res) => {
  try {
    const { userId } = req.body;
    const { id } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    if (challenge.endDate < new Date()) {
      return res.status(400).json({ error: 'Challenge has ended' });
    }

    const existing = await UserChallenge.findOne({ userId, challengeId: id });
    if (existing) {
      return res.status(400).json({ error: 'Already joined this challenge' });
    }

    const userChallenge = new UserChallenge({
      userId,
      challengeId: id,
      status: 'active',
      progress: 0,
      joinedAt: new Date()
    });

    await userChallenge.save();

    res.status(201).json(userChallenge);
  } catch (error) {
    console.error('Error joining challenge:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new challenge (Admin only)
exports.createChallenge = async (req, res) => {
  try {
    const challenge = new Challenge(req.body);
    await challenge.save();
    res.status(201).json(challenge);
  } catch (error) {
    console.error('Error creating challenge:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Helper function to calculate progress
async function calculateProgress(userChallenge, userId) {
  try {
    const challenge = userChallenge.challengeId;
    if (!challenge) return;

    let progress = 0;

    // Example: Healthy Meal Count (Simplistic definition of healthy)
    if (challenge.type === 'healthy_meal_count') {
      const meals = await Meal.find({
        userId,
        date: { $gte: challenge.startDate, $lte: challenge.endDate }
      });

      // Filter "healthy" meals (placeholder logic)
      // e.g., meals with calories between 300 and 800
      const healthyMeals = meals.filter(m => {
        const cals = m.nutrition?.calories || 0;
        return cals > 0 && cals < 800;
      });

      progress = healthyMeals.length;
    }

    // Example: Calorie Limit (Daily average? Or Total?)
    // Let's say "Streak" of days under calorie limit
    else if (challenge.type === 'calorie_limit') {
      // Find days where total calories < target
      // This requires aggregation, skipping for now to keep simple
      // We will just count total meals logged for now as a placeholder
      const meals = await Meal.find({
        userId,
        date: { $gte: challenge.startDate, $lte: challenge.endDate }
      });
      progress = meals.length;
    }

    userChallenge.progress = progress;

    if (userChallenge.status === 'active') {
      // Check completion
      if (challenge.comparisonOperator === 'gte' && progress >= challenge.targetValue) {
        userChallenge.status = 'completed';
        userChallenge.completedAt = new Date();
      }
    }

    await userChallenge.save();
  } catch (err) {
    console.error("Error calculating progress", err);
  }
}
