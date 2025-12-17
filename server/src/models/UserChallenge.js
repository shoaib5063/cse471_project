const mongoose = require('mongoose');

const userChallengeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'failed', 'abandoned'],
    default: 'active'
  },
  progress: {
    type: Number, // Current value (e.g., total calories logged today, or number of healthy meals)
    default: 0
  },
  // For daily tracking (e.g., did they meet the goal today?)
  dailyProgress: [{
    date: { type: Date, default: Date.now },
    value: Number,
    metGoal: Boolean
  }],
  joinedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can only join a challenge once (or active only once)
userChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

module.exports = mongoose.model('UserChallenge', userChallengeSchema, 'userchallenges');
