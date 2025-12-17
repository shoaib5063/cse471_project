const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  ingredients: [{ type: String }],
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fats: { type: Number, default: 0 },
  prepTime: { type: Number, default: 0 },
  tags: [{ type: String }],
  diet: { type: String, index: true },
  source: { type: String },
  servings: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
});

// text index for quick search by name/ingredients/tags
recipeSchema.index({ name: 'text', ingredients: 'text', tags: 'text', description: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);
