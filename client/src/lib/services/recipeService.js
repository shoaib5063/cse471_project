import axios from 'axios';

const SPOONACULAR_API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

/**
 * Map diet preferences to Spoonacular diet parameters
 */
const DIET_MAP = {
  'vegetarian': 'vegetarian',
  'keto': 'ketogenic',
  'gluten-free': 'glutenFree',
};

/**
 * Map meal types to Spoonacular meal types
 */
const MEAL_TYPE_MAP = {
  'breakfast': 'breakfast',
  'lunch': 'lunch',
  'dinner': 'dinner',
  'snack': 'snack',
};

/**
 * Fetch recipes from Spoonacular API
 * @param {string} dietPreference - User's diet preference
 * @param {string} mealType - Type of meal (breakfast, lunch, dinner, snack)
 * @param {number} maxCalories - Maximum calories per meal
 * @param {number} number - Number of recipes to fetch
 * @returns {Promise<Array>} Array of recipe objects
 */
export const fetchRecipes = async (dietPreference, mealType, maxCalories = 600, number = 10) => {
  if (!SPOONACULAR_API_KEY) {
    throw new Error('Spoonacular API key not configured. Please add VITE_SPOONACULAR_API_KEY to your .env file');
  }

  try {
    const diet = DIET_MAP[dietPreference] || '';
    const type = MEAL_TYPE_MAP[mealType] || '';

    const params = {
      apiKey: SPOONACULAR_API_KEY,
      type: type,
      number: number,
      maxCalories: maxCalories,
      addRecipeInformation: true,
      addRecipeNutrition: true,
      fillIngredients: true,
    };

    // Add diet filter if applicable
    if (diet) {
      params.diet = diet;
    }

    const response = await axios.get(`${SPOONACULAR_BASE_URL}/recipes/complexSearch`, {
      params,
      timeout: 10000, // 10 second timeout
    });

    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching recipes from Spoonacular:', error);
    
    if (error.response?.status === 402) {
      throw new Error('API quota exceeded. Please check your Spoonacular API key or upgrade your plan.');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Invalid API key. Please check your VITE_SPOONACULAR_API_KEY in .env file');
    }

    throw new Error(`Failed to fetch recipes: ${error.message}`);
  }
};

/**
 * Transform Spoonacular recipe to our meal format
 * @param {Object} recipe - Spoonacular recipe object
 * @returns {Object} Formatted meal object
 */
export const transformRecipe = (recipe) => {
  const nutrition = recipe.nutrition?.nutrients || [];
  
  const getNutrient = (name) => {
    const nutrient = nutrition.find(n => n.name.toLowerCase().includes(name.toLowerCase()));
    return Math.round(nutrient?.amount || 0);
  };

  return {
    id: recipe.id.toString(),
    name: recipe.title,
    calories: getNutrient('calories'),
    protein: getNutrient('protein'),
    carbs: getNutrient('carbohydrates'),
    fats: getNutrient('fat'),
    prepTime: recipe.readyInMinutes || 30,
    ingredients: recipe.extendedIngredients?.map(ing => ing.name) || [],
    image: recipe.image,
    sourceUrl: recipe.sourceUrl,
    servings: recipe.servings || 1,
  };
};

/**
 * Generate meal plan using Spoonacular API
 * @param {string} dietPreference - User's diet preference
 * @param {number} calorieTarget - Daily calorie target
 * @param {number} planDuration - Number of days
 * @returns {Promise<Array>} Array of day objects with meals
 */
export const generateMealPlanFromAPI = async (dietPreference, calorieTarget, planDuration = 7) => {
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const caloriesPerMeal = {
    breakfast: Math.round(calorieTarget * 0.25), // 25% of daily calories
    lunch: Math.round(calorieTarget * 0.35),      // 35% of daily calories
    dinner: Math.round(calorieTarget * 0.30),    // 30% of daily calories
    snack: Math.round(calorieTarget * 0.10),    // 10% of daily calories
  };

  const plan = [];

  for (let dayIndex = 0; dayIndex < planDuration; dayIndex++) {
    const dayMeals = {
      day: dayIndex + 1,
      date: new Date(Date.now() + dayIndex * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }),
      meals: {
        breakfast: null,
        lunch: null,
        dinner: null,
        snack: null,
      },
    };

    // Fetch meals for each meal type
    for (const mealType of mealTypes) {
      try {
        const recipes = await fetchRecipes(
          dietPreference,
          mealType,
          caloriesPerMeal[mealType] + 100, // Add buffer for flexibility
          5 // Fetch 5 options, pick one randomly
        );

        if (recipes.length > 0) {
          // Randomly select one recipe
          const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
          const transformedMeal = transformRecipe(randomRecipe);
          
          // Scale meal to match target calories
          const targetCalories = caloriesPerMeal[mealType];
          if (transformedMeal.calories > 0) {
            const scale = targetCalories / transformedMeal.calories;
            transformedMeal.calories = Math.round(transformedMeal.calories * scale);
            transformedMeal.protein = Math.round(transformedMeal.protein * scale);
            transformedMeal.carbs = Math.round(transformedMeal.carbs * scale);
            transformedMeal.fats = Math.round(transformedMeal.fats * scale);
          }

          dayMeals.meals[mealType] = transformedMeal;
        }
      } catch (error) {
        console.error(`Error fetching ${mealType} recipes:`, error);
        // Continue with other meals even if one fails
      }
    }

    plan.push(dayMeals);
  }

  return plan;
};

/**
 * Get meal options for a specific meal type
 * @param {string} dietPreference - User's diet preference
 * @param {string} mealType - Type of meal
 * @param {number} maxCalories - Maximum calories
 * @returns {Promise<Array>} Array of meal options
 */
export const getMealOptions = async (dietPreference, mealType, maxCalories = 600) => {
  try {
    const recipes = await fetchRecipes(dietPreference, mealType, maxCalories, 10);
    return recipes.map(transformRecipe);
  } catch (error) {
    console.error('Error fetching meal options:', error);
    throw error;
  }
};

