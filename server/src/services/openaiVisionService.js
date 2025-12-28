const axios = require('axios');

/**
 * Analyze meal image using OpenAI Vision API (GPT-4 Vision)
 * @param {string} imageBase64 - Base64 encoded image (without data URI prefix)
 * @returns {Promise<Array>} - Array of detected foods with nutrition data from USDA
 */
const analyzeMealWithOpenAI = async (imageBase64) => {
  try {
    console.log('Starting OpenAI Vision analysis...');
    
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this meal image and list ALL food items you can identify. For each food item, provide:
1. The food name (be specific, e.g., "grilled chicken breast" not just "chicken")
2. Estimated portion size if visible

Return ONLY a JSON array in this exact format:
[
  {"name": "food name", "portion": "estimated portion"},
  {"name": "food name", "portion": "estimated portion"}
]

Do not include any other text, explanations, or markdown. Just the JSON array.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0]?.message?.content || '';
    console.log('OpenAI Vision response:', content);

    // Parse the JSON response
    let foods = [];
    try {
      // Remove markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      foods = JSON.parse(cleanedContent);
    } catch (parseErr) {
      console.warn('Failed to parse OpenAI response as JSON:', parseErr.message);
      // Try to extract food names from text
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      foods = lines.map(line => {
        const cleaned = line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
        return { name: cleaned, portion: '' };
      }).filter(f => f.name.length > 2);
    }

    if (!Array.isArray(foods) || foods.length === 0) {
      console.warn('No foods detected by OpenAI Vision');
      return [];
    }

    console.log(`OpenAI detected ${foods.length} food items`);

    // Now search USDA for each detected food
    const results = [];
    const seen = new Set();

    for (let i = 0; i < Math.min(foods.length, 10); i++) {
      const foodItem = foods[i];
      const foodName = foodItem.name || foodItem;
      
      if (typeof foodName !== 'string' || foodName.length < 2) continue;

      console.log(`Searching USDA for: "${foodName}"`);

      try {
        const usdaResponse = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
          params: {
            api_key: process.env.USDA_API_KEY,
            query: foodName,
            pageSize: 3
          }
        });

        const usdaFoods = usdaResponse.data.foods || [];
        
        if (usdaFoods.length === 0) {
          console.warn(`  No USDA match for: ${foodName}`);
          continue;
        }

        const food = usdaFoods[0];
        const key = `${food.fdcId}::${food.description}`;
        
        if (seen.has(key)) {
          console.log('  (Duplicate, skipping)');
          continue;
        }
        seen.add(key);

        const nutrients = food.foodNutrients || [];
        const calories = Math.round(nutrients.find(n => n.nutrientName === 'Energy')?.value || 0);
        
        const mapped = {
          fdcId: food.fdcId,
          description: food.description,
          brandName: food.brandName || 'Generic',
          servingSize: food.servingSize || 100,
          servingSizeUnit: food.servingSizeUnit || 'g',
          nutrients: {
            calories: calories,
            protein: Math.round(nutrients.find(n => n.nutrientName === 'Protein')?.value || 0),
            carbs: Math.round(nutrients.find(n => n.nutrientName === 'Carbohydrate, by difference')?.value || 0),
            fat: Math.round(nutrients.find(n => n.nutrientName === 'Total lipid (fat)')?.value || 0),
            fiber: Math.round(nutrients.find(n => n.nutrientName === 'Fiber, total dietary')?.value || 0),
            sugar: Math.round(nutrients.find(n => n.nutrientName === 'Sugars, total including NLEA')?.value || 0)
          }
        };

        results.push(mapped);
        console.log(`  ✅ Added: ${mapped.description} - ${calories} cal`);
      } catch (err) {
        console.warn(`  Error searching USDA for ${foodName}:`, err.message);
      }
    }

    console.log(`🎯 Final results: ${results.length} foods found`);
    return results;
  } catch (error) {
    console.error('Error analyzing image with OpenAI Vision:', error.message);
    throw error;
  }
};

module.exports = {
  analyzeMealWithOpenAI
};
