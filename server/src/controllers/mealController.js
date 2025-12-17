const axios = require('axios');
const Meal = require('../models/Meal');
const Hydration = require('../models/Hydration');
const { analyzeImage, formatFoodResponse } = require('../services/fatsecretService');
const { getLabels } = require('../services/visionService');
const { describeMealImage, getFoodsFromDescription } = require('../services/geminiImageService');

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
    // Accept userId either as a URL param or a query param for flexibility
    const userId = req.params.userId || req.query.userId;
    const { date, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

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
// Get daily summary
const getDailySummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    // Set to start of day in the server's timezone (or UTC if assumed)
    // If date string is '2025-12-15', new Date() gives UTC midnight.
    // If date is undefined, we want today.

    // Create start and end using string manipulation for consistency if date is string
    let startOfDay, endOfDay;

    if (date) {
      startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
    } else {
      const now = new Date();
      startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
    }

    const [meals, hydrationLogs] = await Promise.all([
      Meal.find({
        userId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }),
      Hydration.find({
        userId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      })
    ]);

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

    const totalHydration = hydrationLogs.reduce((sum, log) => sum + log.amount, 0);
    summary.hydration = totalHydration; // in ml

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

// Get nutrient trends
const getNutrientTrends = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 7 } = req.query;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));

    // Ensure we capture the full day for start and end
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    // Group by date
    const dailyStats = {};
    
    // Initialize all days in range to 0
    const tempDate = new Date(startDate);
    while (tempDate <= endDate) {
      const dateStr = tempDate.toISOString().split('T')[0];
      dailyStats[dateStr] = {
        date: dateStr,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0
      };
      tempDate.setDate(tempDate.getDate() + 1);
    }

    meals.forEach(meal => {
      const dateStr = new Date(meal.date).toISOString().split('T')[0];
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].calories += Math.round(meal.nutrition.calories || 0);
        dailyStats[dateStr].protein += Math.round(meal.nutrition.protein || 0);
        dailyStats[dateStr].carbs += Math.round(meal.nutrition.carbs || 0);
        dailyStats[dateStr].fat += Math.round(meal.nutrition.fat || 0);
        dailyStats[dateStr].fiber += Math.round(meal.nutrition.fiber || 0);
        dailyStats[dateStr].sugar += Math.round(meal.nutrition.sugar || 0);
      }
    });

    res.json(Object.values(dailyStats));
  } catch (error) {
    console.error('Error fetching nutrient trends:', error);
    res.status(500).json({ error: 'Failed to fetch nutrient trends' });
  }
};

// Analyze food image using Gemini Vision + USDA API
const analyzeImageForFood = async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Please provide an image in base64 format' });
    }

    console.log('Received image upload, base64 length:', imageBase64.length);

    // Remove data URI prefix if present
    const cleanedImageBase64 = imageBase64.replace(/^data:image\/[^;]+;base64,/, '');
    console.log('Cleaned image base64 length:', cleanedImageBase64.length);

    // PRIMARY: Try Gemini image description first
    let foods = [];
    try {
      console.log('Step 1: Using Gemini to describe the meal...');
      const description = await describeMealImage(cleanedImageBase64);
      console.log('Step 2: Extracting foods from Gemini description...');
      foods = await getFoodsFromDescription(description);
      
      if (foods.length > 0) {
        console.log('✅ Gemini analysis successful! Found', foods.length, 'foods');
        // Format foods for frontend consumption
        const formatted = foods.map(f => ({
          fdcId: f.fdcId,
          food_entry_name: f.description,
          food_name: f.description,
          food_type: 'USDA',
          eaten: {
            food_name_singular: f.description,
            food_name_plural: f.description,
            units: 1,
            metric_description: f.servingSizeUnit || 'g',
            total_metric_amount: f.servingSize || 100,
            per_unit_metric_amount: f.servingSize || 100,
            total_nutritional_content: {
              calories: f.nutrients.calories || 0,
              carbohydrate: f.nutrients.carbs || 0,
              protein: f.nutrients.protein || 0,
              fat: f.nutrients.fat || 0,
              fiber: f.nutrients.fiber || 0,
              sugar: f.nutrients.sugar || 0
            }
          }
        }));
        
        console.log('📤 Returning', formatted.length, 'foods via Gemini');
        return res.json({
          success: true,
          foods: formatted,
          source: 'gemini',
          description: description.substring(0, 200)
        });
      } else {
        console.log('⚠️ Gemini found no foods, moving to fallback...');
      }
    } catch (err) {
      console.error('❌ Gemini analysis error:', err.message || err);
    }

    // FALLBACK: Try FatSecret
    console.log('Step 3: Falling back to FatSecret API...');
    try {
      const fatsecretResponse = await analyzeImage(cleanedImageBase64);
      const formattedFoods = formatFoodResponse(fatsecretResponse);
      
      if (formattedFoods && formattedFoods.length > 0) {
        console.log('✅ FatSecret analysis successful! Found', formattedFoods.length, 'foods');
        return res.json({
          success: true,
          foods: formattedFoods,
          source: 'fatsecret'
        });
      }
    } catch (err) {
      console.warn('⚠️ FatSecret analysis failed:', err.message || err);
    }

    // LAST RESORT: Return suggestions from existing meals
    console.log('Step 4: Returning popular meals as suggestions...');
    let suggestions = [];
    try {
      const agg = await Meal.aggregate([
        { $unwind: '$foodItems' },
        { $group: { 
            _id: '$foodItems.description', 
            count: { $sum: 1 }, 
            sample: { $first: '$foodItems' },
            avgNutrition: { 
              $avg: { 
                calories: '$nutrition.calories',
                protein: '$nutrition.protein',
                carbs: '$nutrition.carbs',
                fat: '$nutrition.fat',
                fiber: '$nutrition.fiber',
                sugar: '$nutrition.sugar'
              }
            }
          } 
        },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ]).allowDiskUse(true);

      const rawSuggestions = agg.map(a => ({
        description: a._id,
        fdcId: a.sample?.fdcId || null,
        servingSize: a.sample?.servingSize || 100,
        servingSizeUnit: a.sample?.servingSizeUnit || 'g',
        avgNutrition: a.avgNutrition || {}
      }));

      const enriched = await Promise.all(rawSuggestions.map(async s => {
        try {
          if (s.avgNutrition && s.avgNutrition.calories && s.avgNutrition.calories > 0) {
            console.log('Using meal nutrition for suggestion:', s.description, s.avgNutrition.calories);
            return {
              description: s.description,
              fdcId: s.fdcId,
              servingSize: s.servingSize,
              servingSizeUnit: s.servingSizeUnit,
              nutrients: {
                calories: Math.round(s.avgNutrition.calories || 0),
                protein: Math.round(s.avgNutrition.protein || 0),
                carbs: Math.round(s.avgNutrition.carbs || 0),
                fat: Math.round(s.avgNutrition.fat || 0),
                fiber: Math.round(s.avgNutrition.fiber || 0),
                sugar: Math.round(s.avgNutrition.sugar || 0)
              }
            };
          }
        } catch (err) {
          console.warn('Failed to enrich suggestion', s.description, err.message || err);
        }
        return {
          description: s.description,
          fdcId: s.fdcId || null,
          servingSize: s.servingSize,
          servingSizeUnit: s.servingSizeUnit,
          nutrients: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
        };
      }));

      suggestions = enriched;
    } catch (err) {
      console.warn('Failed to aggregate meal suggestions:', err.message || err);
    }

    return res.json({
      success: true,
      foods: [],
      suggestions: suggestions,
      source: 'suggestions',
      message: 'Could not automatically detect meal. Using suggestions from your meal history.'
    });
  } catch (error) {
    console.error('Error analyzing image for food:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: error.message || 'Failed to analyze food image',
      details: error.response?.data || null
    });
  }
};

module.exports = {
  searchFood,
  getFoodDetails,
  logMeal,
  getUserMeals,
  getDailySummary,
  deleteMeal,
  updateMeal,
  getNutrientTrends,
  analyzeImageForFood
};
