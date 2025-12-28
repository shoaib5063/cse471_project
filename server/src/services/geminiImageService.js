const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Describe a meal image using Gemini Vision
 * @param {string} imageBase64 - Base64 encoded image (without data URI prefix)
 * @returns {Promise<string>} - Description of foods detected in the image
 */
const describeMealImage = async (imageBase64) => {
  try {
    console.log('Starting Gemini image analysis...');
    
    // Use gemini-1.5-flash-latest which supports vision
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `ANALYZE THIS MEAL IMAGE AND LIST EVERY FOOD ITEM YOU SEE.

Instructions:
- List ONLY the food/ingredient names
- One food per line
- Be specific (e.g., "chicken breast" not "meat")
- Include estimated portion if visible
- Do NOT include instructions, explanations, or metadata
- Do NOT use bullet points or numbers
- Do NOT list the same food twice

Example format:
Grilled chicken breast
Brown rice
Steamed broccoli
Garlic butter sauce

Now analyze the image:`;

    const response = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      },
      prompt
    ]);

    const description = response.response.text();
    console.log('Gemini description:', description);
    return description;
  } catch (error) {
    console.error('Error analyzing image with Gemini:', error.message);
    throw new Error('Failed to analyze image with Gemini: ' + error.message);
  }
};

/**
 * Extract food items from Gemini's description and search USDA for each
 * @param {string} description - Gemini's description of the meal
 * @returns {Promise<Array>} - Array of foods with nutrition data from USDA
 */
const getFoodsFromDescription = async (description) => {
  try {
    console.log('Raw Gemini description:', description);
    
    // Split description into individual food items (handles newlines and commas)
    let foodLines = description
      .split(/[\n,;]/)
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.toLowerCase().includes('example'))
      .slice(0, 10); // limit to 10 items

    // Remove any lines that are too generic or are instructions
    foodLines = foodLines.filter(line => {
      const lower = line.toLowerCase();
      return !lower.includes('here') && 
             !lower.includes('format') &&
             !lower.includes('list') &&
             !lower.includes('example') &&
             !lower.includes('one per') &&
             line.length > 2;
    });

    console.log('📋 Extracted food lines:', foodLines);

    const results = [];
    const seen = new Set();

    for (let i = 0; i < foodLines.length; i++) {
      const foodLine = foodLines[i];
      console.log(`Processing food ${i + 1}/${foodLines.length}: "${foodLine}"`);
      
      try {
        // Clean up the food line - remove sizes, quantities, descriptors
        let cleanQuery = foodLine
          .replace(/,.*$/g, '') // remove everything after comma
          .replace(/\(.*\)/g, '') // remove parenthetical info
          .replace(/\d+\s*(cup|cups|g|oz|piece|pieces|slice|slices|inch|inches)/gi, '') // remove quantities
          .replace(/\s+(medium|large|small|cooked|raw|steamed|grilled|fried|baked|boiled)\s*/gi, ' ') // remove prep methods
          .trim();

        if (cleanQuery.length < 2) {
          console.warn('Skipping line after cleaning:', foodLine);
          continue;
        }

        console.log(`  Searching USDA for: "${cleanQuery}"`);

        // Search USDA for this food item
        const response = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
          params: {
            api_key: process.env.USDA_API_KEY,
            query: cleanQuery,
            pageSize: 3
          }
        });

        const foods = response.data.foods || [];
        console.log(`  Found ${foods.length} USDA matches`);
        
        if (foods.length === 0) {
          console.warn('  ⚠️ No USDA match for:', cleanQuery);
          continue;
        }

        const food = foods[0];
        const key = `${food.fdcId}::${food.description}`;
        
        // Avoid duplicates
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
        console.warn('  Error searching USDA for', foodLine, ':', err.message);
      }
    }

    console.log('🎯 Final results:', results.length, 'foods found');
    return results;
  } catch (error) {
    console.error('Error processing description:', error.message);
    throw error;
  }
};

module.exports = {
  describeMealImage,
  getFoodsFromDescription
};
