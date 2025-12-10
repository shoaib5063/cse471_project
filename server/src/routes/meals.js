const express = require('express');
const router = express.Router();
const {
  searchFood,
  getFoodDetails,
  logMeal,
  getUserMeals,
  getDailySummary,
  deleteMeal,
  updateMeal
} = require('../controllers/mealController');

// USDA Food Search - NEW feature for your meal logging
router.get('/search', searchFood);

// Get detailed food nutrition - NEW feature
router.get('/food/:fdcId', getFoodDetails);

// Get all meals for a user (COMPLETING the TODO your teammate left)
router.get('/user/:userId', getUserMeals);

// Create a new meal (COMPLETING the TODO your teammate left)
router.post('/log', logMeal);

// Get daily summary - NEW feature
router.get('/summary/:userId', getDailySummary);

// Update a meal - NEW feature
router.put('/:mealId', updateMeal);

// Delete a meal - NEW feature
router.delete('/:mealId', deleteMeal);

module.exports = router;
