// CommonJS seed script to POST the built-in recipes to the server seed endpoint
// Usage: node client/scripts/seedRecipes.cjs

const axios = require('axios');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

const RECIPES = [
  // vegetarian
  { name: 'Mediterranean Quinoa Bowl', description: 'A hearty bowl with quinoa, roasted vegetables, feta, and tahini dressing', ingredients: ['quinoa','bell peppers','zucchini','feta cheese','olive oil'], calories:450, protein:18, carbs:55, fats:18, prepTime:30, tags:['vegetarian','high-protein','gluten-free'], diet:'vegetarian' },
  { name: 'Lentil Curry', description: 'Spiced red lentils with coconut milk and vegetables', ingredients:['lentils','coconut milk','onions','garlic','ginger','tomatoes'], calories:380, protein:20, carbs:45, fats:12, prepTime:40, tags:['vegetarian','vegan','high-protein'], diet:'vegetarian' },
  { name: 'Greek Yogurt Parfait', description: 'Layered yogurt with fresh berries and granola', ingredients:['greek yogurt','berries','granola','honey'], calories:320, protein:15, carbs:45, fats:8, prepTime:10, tags:['vegetarian','quick','breakfast'], diet:'vegetarian' },

  // keto
  { name: 'Keto Chicken Caesar Salad', description: 'Grilled chicken with romaine, parmesan, and keto-friendly caesar dressing', ingredients:['chicken breast','romaine lettuce','parmesan','olive oil','lemon'], calories:420, protein:35, carbs:6, fats:28, prepTime:20, tags:['keto','low-carb','high-protein'], diet:'keto' },
  { name: 'Avocado Egg Bowl', description: 'Scrambled eggs with avocado, bacon, and cheese', ingredients:['eggs','avocado','bacon','cheddar cheese'], calories:480, protein:28, carbs:8, fats:36, prepTime:15, tags:['keto','breakfast','high-protein'], diet:'keto' },
  { name: 'Salmon with Asparagus', description: 'Pan-seared salmon with roasted asparagus and lemon butter', ingredients:['salmon','asparagus','butter','lemon','garlic'], calories:450, protein:38, carbs:5, fats:30, prepTime:25, tags:['keto','low-carb','high-protein'], diet:'keto' },

  // gluten-free
  { name: 'Grilled Chicken & Rice', description: 'Herb-marinated chicken with jasmine rice and steamed vegetables', ingredients:['chicken breast','jasmine rice','broccoli','carrots','soy sauce'], calories:520, protein:42, carbs:55, fats:12, prepTime:35, tags:['gluten-free','high-protein'], diet:'gluten-free' },
  { name: 'Shrimp Tacos (Corn Tortillas)', description: 'Spiced shrimp with avocado, cabbage slaw, and lime', ingredients:['shrimp','corn tortillas','avocado','cabbage','lime','cilantro'], calories:380, protein:32, carbs:42, fats:12, prepTime:20, tags:['gluten-free','quick','high-protein'], diet:'gluten-free' },
  { name: 'Berry Chia Pudding', description: 'Creamy chia pudding topped with fresh berries', ingredients:['chia seeds','coconut milk','berries','honey','vanilla'], calories:280, protein:10, carbs:35, fats:12, prepTime:5, tags:['gluten-free','vegetarian','breakfast'], diet:'gluten-free' },
];

(async () => {
  try {
    const url = `${SERVER_URL}/api/recipes/seed?replace=true`;
    console.log('Seeding recipes to', url);
    const res = await axios.post(url, RECIPES, { timeout: 20000 });
    console.log('Seed response:', res.data);
  } catch (err) {
    console.error('Seed failed:', err.response?.data || err.message || err);
    process.exit(1);
  }
})();
