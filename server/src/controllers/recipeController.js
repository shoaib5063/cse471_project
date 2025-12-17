const Recipe = require('../models/Recipe');

/**
 * Seed recipes into the database. Expects an array of recipes in req.body.
 */
const seedRecipes = async (req, res) => {
  try {
    const recipes = Array.isArray(req.body) ? req.body : req.body.recipes;
    if (!recipes || recipes.length === 0) {
      return res.status(400).json({ error: 'No recipes provided for seeding' });
    }

    // optional: clear existing recipes (only if client supplies ?replace=true)
    if (req.query.replace === 'true') {
      await Recipe.deleteMany({});
    }

    // Upsert each recipe by name to avoid duplicates
    const results = [];
    for (const r of recipes) {
      const filter = { name: r.name };
      const update = { $set: r };
      const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
      const doc = await Recipe.findOneAndUpdate(filter, update, opts);
      results.push(doc);
    }

    return res.json({ success: true, count: results.length });
  } catch (error) {
    console.error('Error seeding recipes:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get recipes with optional filters: diet, ingredients (comma-separated), q (text search)
 */
const getRecipes = async (req, res) => {
  try {
    const { diet, ingredients, q, limit = 20 } = req.query;
    const filter = {};

    if (diet) filter.diet = diet;

    if (ingredients) {
      const list = ingredients.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      filter.ingredients = { $all: list };
    }

    if (q) {
      filter.$text = { $search: q };
    }

    const recipes = await Recipe.find(filter).limit(parseInt(limit, 10));
    return res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return res.status(500).json({ error: error.message });
  }
};

const createRecipe = async (req, res) => {
  try {
    const data = req.body;
    const recipe = new Recipe(data);
    await recipe.save();
    return res.status(201).json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  seedRecipes,
  getRecipes,
  createRecipe,
};
