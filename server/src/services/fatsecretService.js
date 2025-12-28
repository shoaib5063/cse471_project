const axios = require('axios');

const FATSECRET_CLIENT_ID = process.env.FATSECRET_CLIENT_ID;
const FATSECRET_CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET;
const FATSECRET_API_URL = 'https://platform.fatsecret.com/rest/image-recognition/v2';

// Get OAuth token for FatSecret API
const getAccessToken = async () => {
  try {
    const response = await axios.post('https://oauth.fatsecret.com/connect/token',
      'grant_type=client_credentials&scope=image-recognition',
      {
        auth: {
          username: FATSECRET_CLIENT_ID,
          password: FATSECRET_CLIENT_SECRET
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    console.log('FatSecret token obtained successfully');
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting FatSecret access token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with FatSecret API');
  }
};

// Analyze image using FatSecret Image Recognition API
const analyzeImage = async (imageBase64) => {
  try {
    console.log('Starting image analysis...');
    const accessToken = await getAccessToken();
    console.log('Sending image to FatSecret API...');

    const response = await axios.post(FATSECRET_API_URL, {
      image_b64: imageBase64,
      include_food_data: true,
      region: 'US',
      language: 'en'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('FatSecret raw response:', JSON.stringify(response.data, null, 2));

    // Check various possible response structures
    const foodResponse = response.data?.food_response;
    const foodsDetected = Array.isArray(foodResponse) ? foodResponse.length : (foodResponse?.food?.length || 0);

    console.log('FatSecret response received:', foodsDetected, 'foods detected');
    return response.data;
  } catch (error) {
    console.error('Error analyzing image with FatSecret:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    if (error.response?.status === 401) {
      throw new Error('FatSecret API authentication failed');
    }
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.error_description || 'Invalid image format or parameters');
    }
    throw new Error(error.response?.data?.error || error.message || 'Failed to analyze food image');
  }
};

// Parse FatSecret response and format nutrition data
const formatFoodResponse = (fatsecretResponse) => {
  if (!fatsecretResponse.food_response || fatsecretResponse.food_response.length === 0) {
    console.log('No foods detected in image, returning empty array');
    return [];
  }

  // helper: safely extract numeric nutrient from various possible locations
  const getNumericNutrient = (foodObj, nutrientKeys = []) => {
    const tryParse = (val) => {
      if (val == null) return null;
      const n = parseFloat(val);
      if (!Number.isFinite(n)) return null;
      return n;
    };

    // 1) eaten.total_nutritional_content
    const eaten = foodObj.eaten?.total_nutritional_content || foodObj.eaten;
    if (eaten && typeof eaten === 'object') {
      for (const k of nutrientKeys) {
        if (k in eaten) {
          const v = tryParse(eaten[k]);
          if (v != null) return v;
        }
      }
    }

    // 2) food.servings.serving (could be array or object)
    const servings = foodObj.food?.servings?.serving;
    if (servings) {
      const first = Array.isArray(servings) ? servings[0] : servings;
      for (const k of ['calories', 'calorie', 'energy', ...nutrientKeys]) {
        if (k in first) {
          const v = tryParse(first[k]);
          if (v != null) return v;
        }
      }
      // some responses embed nutrients as array
      const nutrientsArray = first.nutrients || first.food_nutrients || first.foodNutrients;
      if (Array.isArray(nutrientsArray)) {
        for (const nutrient of nutrientsArray) {
          const name = (nutrient.nutrientName || nutrient.nutrient?.name || nutrient.name || '').toLowerCase();
          if (name.includes('energy') || name.includes('calori')) {
            const v = tryParse(nutrient.value || nutrient.amount || nutrient.nutrient?.amount || nutrient.nutrient?.value);
            if (v != null) return v;
          }
        }
      }
    }

    // 3) food.food_nutrients or food.foodNutrients (top-level arrays)
    const topNutrients = foodObj.food?.food_nutrients || foodObj.food?.foodNutrients || foodObj.food?.foodNutrients;
    if (Array.isArray(topNutrients)) {
      for (const nutrient of topNutrients) {
        const name = (nutrient.nutrientName || nutrient.nutrient?.name || nutrient.name || '').toLowerCase();
        if (name.includes('energy') || name.includes('calori')) {
          const v = tryParse(nutrient.value || nutrient.amount || nutrient.nutrient?.amount || nutrient.nutrient?.value);
          if (v != null) return v;
        }
      }
    }

    // 4) direct numeric fields on food object
    for (const k of nutrientKeys) {
      if (k in foodObj) {
        const v = tryParse(foodObj[k]);
        if (v != null) return v;
      }
    }

    return 0;
  };

  const mapped = fatsecretResponse.food_response.map(food => {
    const calories = getNumericNutrient(food, ['calories', 'energy']);
    if (!calories || calories === 0) {
      console.warn('FatSecret food returned 0 calories — inspecting keys for debugging', {
        food_entry_name: food.food_entry_name,
        food_keys: Object.keys(food.food || {}),
        eaten_keys: food.eaten ? Object.keys(food.eaten) : null
      });
    }

    return {
      food_id: food.food_id,
      food_entry_name: food.food_entry_name,
      food_name: food.food?.food_name || food.food_entry_name,
      food_type: food.food?.food_type || 'Generic',
      food_url: food.food?.food_url,
      eaten: {
        food_name_singular: food.eaten?.food_name_singular || food.food_entry_name,
        food_name_plural: food.eaten?.food_name_plural || food.food_entry_name,
        units: food.eaten?.units || 1,
        metric_description: food.eaten?.metric_description || 'g',
        total_metric_amount: food.eaten?.total_metric_amount || 100,
        per_unit_metric_amount: food.eaten?.per_unit_metric_amount || 100,
        total_nutritional_content: {
          calories: calories,
          carbohydrate: getNumericNutrient(food, ['carbohydrate', 'carb', 'carbs']),
          protein: getNumericNutrient(food, ['protein']),
          fat: getNumericNutrient(food, ['fat', 'total_lipid', 'total_lipid_(fat)']),
          saturated_fat: getNumericNutrient(food, ['saturated_fat']),
          polyunsaturated_fat: getNumericNutrient(food, ['polyunsaturated_fat']),
          monounsaturated_fat: getNumericNutrient(food, ['monounsaturated_fat']),
          cholesterol: getNumericNutrient(food, ['cholesterol']),
          sodium: getNumericNutrient(food, ['sodium']),
          potassium: getNumericNutrient(food, ['potassium']),
          fiber: getNumericNutrient(food, ['fiber']),
          sugar: getNumericNutrient(food, ['sugar']),
          vitamin_a: getNumericNutrient(food, ['vitamin_a']),
          vitamin_c: getNumericNutrient(food, ['vitamin_c']),
          calcium: getNumericNutrient(food, ['calcium']),
          iron: getNumericNutrient(food, ['iron'])
        }
      },
      suggested_serving: food.suggested_serving,
      servings: food.food?.servings?.serving || []
    };
  });

  return mapped;
};

module.exports = {
  analyzeImage,
  formatFoodResponse,
  getAccessToken
};
