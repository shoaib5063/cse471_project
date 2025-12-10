const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  mealName: {
    type: String,
    required: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  foodItems: [{
    fdcId: Number,
    description: String,
    quantity: Number,
    servingSize: Number,
    servingSizeUnit: String
  }],
  nutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 }
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
mealSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Meal', mealSchema);
