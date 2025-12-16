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

// Get all meals with query param - for compatibility
router.get('/', async (req, res) => {
  const userId = req.query.userId;
  if (userId) {
    req.params.userId = userId;
    return getUserMeals(req, res);
  }
  res.status(400).json({ error: 'userId is required' });
});

// Get detailed food nutrition - NEW feature
router.get('/food/:fdcId', getFoodDetails);


// Get all meals for a user (COMPLETING the TODO your teammate left)
router.get('/user/:userId', getUserMeals);


// Create a new meal - Alternative endpoint
router.post('/', logMeal);

// Create a new meal (COMPLETING the TODO your teammate left)
router.post('/log', logMeal);


// Get daily summary - NEW feature
router.get('/summary/:userId', getDailySummary);


// Update a meal - NEW feature
router.put('/:mealId', updateMeal);


// Delete a meal - NEW feature
router.delete('/:mealId', deleteMeal);

// Add mood to existing meal
router.patch('/:mealId/mood', async (req, res) => {
  try {
    const { mealId } = req.params;
    const { moodBefore, moodAfter, moodNotes } = req.body;
    
    const Meal = require('../models/Meal');
    
    const updatedMeal = await Meal.findByIdAndUpdate(
      mealId,
      { 
        $set: { 
          moodBefore, 
          moodAfter, 
          moodNotes 
        } 
      },
      { new: true }
    );
    
    if (!updatedMeal) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    
    res.json({
      success: true,
      data: updatedMeal,
      message: 'Mood tracking updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get mood patterns for a user
router.get('/mood-patterns/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    const Meal = require('../models/Meal');
    
    const query = { 
      userId,
      $or: [
        { moodBefore: { $exists: true, $ne: null } },
        { moodAfter: { $exists: true, $ne: null } }
      ]
    };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const meals = await Meal.find(query)
      .sort({ date: -1 })
      .select('mealName mealType moodBefore moodAfter moodNotes date');
    
    res.json({
      success: true,
      data: meals,
      count: meals.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;
