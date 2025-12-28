const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'banned'],
    default: 'active'
  },
  dailyCalorieGoal: {
    type: Number,
    default: 2000
  },
  dailyHydrationGoal: {
    type: Number,
    default: 2000
  },
  // Health Form Data
  healthProfile: {
    age: { type: Number, min: 0 },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', null],
      default: null
    },
    height: { type: Number, min: 0 }, // in cm
    weight: { type: Number, min: 0 }, // in kg
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active', null],
      default: null
    },
    fitnessGoal: {
      type: String,
      enum: ['weight_loss', 'muscle_gain', 'maintain', 'general_health', null],
      default: null
    },
    medicalConditions: [{
      type: String,
      enum: ['diabetes', 'hypertension', 'heart_disease', 'thyroid', 'pcos', 'other', 'none']
    }],
    allergies: [{
      type: String
    }],
    dietaryRestrictions: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'keto', 'halal', 'kosher', 'none']
    }],
    // Auto-generated suggestions
    dietarySuggestions: [{
      category: String,
      suggestion: String,
      priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
      }
    }],
    lastHealthFormUpdate: {
      type: Date,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
