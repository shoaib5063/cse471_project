const express = require('express');
const router = express.Router();
const { seedRecipes, getRecipes, createRecipe } = require('../controllers/recipeController');

// Seed multiple recipes (body: array). Optional query ?replace=true to clear collection first.
router.post('/seed', seedRecipes);

// Create a single recipe
router.post('/', createRecipe);

// Get recipes with filters
router.get('/', getRecipes);

module.exports = router;
