const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['streak', 'calorie_limit', 'healthy_meal_count', 'protein_goal', 'hydration_goal', 'custom'],
    required: true
  },
  // The numerical target to reach (e.g., 2000 for calories, 5 for meal count)
  targetValue: {
    type: Number,
    required: true
  },
  // For 'calorie_limit', 'less_than' is true. For 'protein_goal', 'less_than' is false (more is better).
  comparisonOperator: {
    type: String,
    enum: ['gt', 'lt', 'eq', 'gte', 'lte'],
    default: 'gte'
  },
  unit: {
    type: String, // e.g., 'kcal', 'meals', 'grams'
    default: ''
  },
  durationDays: {
    type: Number,
    default: 7
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  xpReward: {
    type: Number,
    default: 100
  },
  icon: {
    type: String, // name of icon to use on frontend
    default: 'Trophy'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Challenge', challengeSchema, 'challenges');
