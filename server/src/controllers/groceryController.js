exports.generate = async (req, res) => {
  try {
    const mealPlan = Array.isArray(req.body.mealPlan) ? req.body.mealPlan : [];
    const items = [];
    for (const day of mealPlan) {
      if (!day || !day.meals) continue;
      for (const meal of Object.values(day.meals)) {
        if (meal && Array.isArray(meal.ingredients)) {
          for (const ing of meal.ingredients) {
            items.push(String(ing));
          }
        }
      }
    }
    const normalize = (s) =>
      s.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
    const singularize = (s) => {
      if (s === 'tomatoes') return 'tomato';
      if (s === 'potatoes') return 'potato';
      if (s === 'berries') return 'berry';
      if (s.endsWith('es')) return s.slice(0, -2);
      if (s.endsWith('s')) return s.slice(0, -1);
      return s;
    };
    const categoryMap = {
      'chicken breast': 'protein',
      beef: 'protein',
      pork: 'protein',
      fish: 'protein',
      salmon: 'protein',
      tuna: 'protein',
      egg: 'dairy',
      milk: 'dairy',
      cheese: 'dairy',
      yogurt: 'dairy',
      butter: 'dairy',
      tofu: 'protein',
      tempeh: 'protein',
      lettuce: 'produce',
      spinach: 'produce',
      kale: 'produce',
      broccoli: 'produce',
      carrot: 'produce',
      tomato: 'produce',
      cucumber: 'produce',
      pepper: 'produce',
      onion: 'produce',
      garlic: 'produce',
      potato: 'produce',
      zucchini: 'produce',
      mushroom: 'produce',
      banana: 'produce',
      apple: 'produce',
      berry: 'produce',
      grape: 'produce',
      avocado: 'produce',
      rice: 'grains',
      quinoa: 'grains',
      pasta: 'grains',
      bread: 'grains',
      tortilla: 'grains',
      oats: 'grains',
      'olive oil': 'pantry',
      oil: 'pantry',
      salt: 'pantry',
      pepper: 'pantry',
      sugar: 'pantry',
      flour: 'pantry',
      honey: 'pantry',
      vinegar: 'pantry',
      'soy sauce': 'pantry',
      spice: 'pantry',
      herb: 'pantry',
      'coconut milk': 'pantry',
      'tomato sauce': 'pantry',
      beans: 'pantry',
      lentil: 'pantry',
      chickpea: 'pantry',
      nuts: 'pantry',
      seeds: 'pantry'
    };
    const counts = {};
    for (const raw of items) {
      let name = singularize(normalize(raw));
      if (!name) continue;
      counts[name] = (counts[name] || 0) + 1;
    }
    const categorize = (name) => {
      if (categoryMap[name]) return categoryMap[name];
      if (name.includes('leaf') || name.includes('green')) return 'produce';
      if (name.includes('chicken') || name.includes('beef') || name.includes('pork') || name.includes('fish'))
        return 'protein';
      if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') || name.includes('egg'))
        return 'dairy';
      if (name.includes('rice') || name.includes('bread') || name.includes('oat') || name.includes('pasta'))
        return 'grains';
      return 'pantry';
    };
    const categories = {};
    for (const [name, count] of Object.entries(counts)) {
      const cat = categorize(name);
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push({ name, count });
    }
    for (const k of Object.keys(categories)) {
      categories[k].sort((a, b) => a.name.localeCompare(b.name));
    }
    res.json({ categories });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
};
