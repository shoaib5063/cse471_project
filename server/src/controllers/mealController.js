const axios = require('axios');
const Meal = require('../models/Meal');

// Search food using USDA API
const searchFood = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Please provide a search query' });
    }

    const response = await axios.get(
      'https://api.nal.usda.gov/fdc/v1/foods/search',
      {
        params: {
          api_key: process.env.USDA_API_KEY,
          query: query,
          pageSize: 10
        }
      }
    );

    const foods = response.data.foods.map(food => ({
      fdcId: food.fdcId,
      description: food.description,
      brandName: food.brandName || 'Generic',
      servingSize: food.servingSize || 100,
      servingSizeUnit: food.servingSizeUnit || 'g',
      nutrients: {
        calories: Math.round(food.foodNutrients.find(n => n.nutrientName === 'Energy')?.value || 0),
        protein: Math.round(food.foodNutrients.find(n => n.nutrientName === 'Protein')?.value || 0),
        carbs: Math.round(food.foodNutrients.find(n => n.nutrientName === 'Carbohydrate, by difference')?.value || 0),
        fat: Math.round(food.foodNutrients.find(n => n.nutrientName === 'Total lipid (fat)')?.value || 0),
        fiber: Math.round(food.foodNutrients.find(n => n.nutrientName === 'Fiber, total dietary')?.value || 0),
        sugar: Math.round(food.foodNutrients.find(n => n.nutrientName === 'Sugars, total including NLEA')?.value || 0)
      }
    }));

    res.json(foods);
  } catch (error) {
    console.error('USDA API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to search food',
      details: error.response?.data || error.message
    });
  }
};


// Get detailed nutrition info for a specific food
const getFoodDetails = async (req, res) => {
  try {
    const { fdcId } = req.params;

    const response = await axios.get(
      `https://api.nal.usda.gov/fdc/v1/food/${fdcId}`,
      {
        params: {
          api_key: process.env.USDA_API_KEY
        }
      }
    );

    const food = response.data;

    res.json({
      fdcId: food.fdcId,
      description: food.description,
      brandName: food.brandName || 'Generic',
      servingSize: food.servingSize || 100,
      servingSizeUnit: food.servingSizeUnit || 'g',
      nutrients: {
        calories: food.foodNutrients.find(n => n.nutrient.name === 'Energy')?.amount || 0,
        protein: food.foodNutrients.find(n => n.nutrient.name === 'Protein')?.amount || 0,
        carbs: food.foodNutrients.find(n => n.nutrient.name === 'Carbohydrate, by difference')?.amount || 0,
        fat: food.foodNutrients.find(n => n.nutrient.name === 'Total lipid (fat)')?.amount || 0,
        fiber: food.foodNutrients.find(n => n.nutrient.name === 'Fiber, total dietary')?.amount || 0,
        sugar: food.foodNutrients.find(n => n.nutrient.name === 'Sugars, total including NLEA')?.amount || 0
      }
    });
  } catch (error) {
    console.error('USDA API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to get food details',
      details: error.message
    });
  }
};

// Log a new meal
const logMeal = async (req, res) => {
  try {
    const { userId, mealName, mealType, foodItems, nutrition, date, moodBefore, moodAfter, moodNotes } = req.body;
    
    console.log('📝 Logging meal:', { mealName, mealType });
    console.log('😊 Mood data received:', { moodBefore, moodAfter, moodNotes });
    
    if (!userId || !mealName || !mealType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const meal = new Meal({
      userId,
      mealName,
      mealType,
      foodItems: foodItems || [],
      nutrition,
      date: date || new Date(),
      moodBefore,
      moodAfter,
      moodNotes
    });

    console.log('💾 Saving meal with mood:', meal);
    
    await meal.save();
    res.status(201).json({ message: 'Meal logged successfully', meal });
  } catch (error) {
    console.error('Error logging meal:', error);
    res.status(500).json({ error: 'Failed to log meal' });
  }
};

// Get meals for a user
const getUserMeals = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, startDate, endDate } = req.query;

    let query = { userId };

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = {
        $gte: targetDate,
        $lt: nextDay
      };
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const meals = await Meal.find(query).sort({ date: -1 });
    res.json(meals);
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
};

// Get daily summary
const getDailySummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const meals = await Meal.find({
      userId,
      date: {
        $gte: targetDate,
        $lt: nextDay
      }
    });

    const summary = meals.reduce((acc, meal) => {
      acc.calories += meal.nutrition.calories || 0;
      acc.protein += meal.nutrition.protein || 0;
      acc.carbs += meal.nutrition.carbs || 0;
      acc.fat += meal.nutrition.fat || 0;
      acc.fiber += meal.nutrition.fiber || 0;
      acc.sugar += meal.nutrition.sugar || 0;
      acc.mealCount += 1;
      return acc;
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      mealCount: 0
    });

    res.json(summary);
  } catch (error) {
    console.error('Error getting daily summary:', error);
    res.status(500).json({ error: 'Failed to get daily summary' });
  }
};

// Delete a meal
const deleteMeal = async (req, res) => {
  try {
    const { mealId } = req.params;
    await Meal.findByIdAndDelete(mealId);
    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
};

// Update a meal
const updateMeal = async (req, res) => {
  try {
    const { mealId } = req.params;
    const updates = req.body;

    const meal = await Meal.findByIdAndUpdate(mealId, updates, { new: true });
    
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    res.json({ message: 'Meal updated successfully', meal });
  } catch (error) {
    console.error('Error updating meal:', error);
    res.status(500).json({ error: 'Failed to update meal' });
  }
};

module.exports = {
  searchFood,
  getFoodDetails,
  logMeal,
  getUserMeals,
  getDailySummary,
  deleteMeal,
  updateMeal
};
