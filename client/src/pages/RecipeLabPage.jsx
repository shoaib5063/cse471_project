import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { ChefHat, Search, Plus, X, Target, ShoppingCart, Sparkles } from 'lucide-react';
import axios from 'axios';

// Recipe database with dietary tags
const RECIPE_DATABASE = {
  vegetarian: [
    {
      id: 1,
      name: 'Mediterranean Quinoa Bowl',
      description: 'A hearty bowl with quinoa, roasted vegetables, feta, and tahini dressing',
      ingredients: ['quinoa', 'bell peppers', 'zucchini', 'feta cheese', 'olive oil'],
      calories: 450,
      protein: 18,
      carbs: 55,
      fats: 18,
      prepTime: 30,
      tags: ['vegetarian', 'high-protein', 'gluten-free'],
    },
    {
      id: 2,
      name: 'Lentil Curry',
      description: 'Spiced red lentils with coconut milk and vegetables',
      ingredients: ['lentils', 'coconut milk', 'onions', 'garlic', 'ginger', 'tomatoes'],
      calories: 380,
      protein: 20,
      carbs: 45,
      fats: 12,
      prepTime: 40,
      tags: ['vegetarian', 'vegan', 'high-protein'],
    },
    {
      id: 3,
      name: 'Greek Yogurt Parfait',
      description: 'Layered yogurt with fresh berries and granola',
      ingredients: ['greek yogurt', 'berries', 'granola', 'honey'],
      calories: 320,
      protein: 15,
      carbs: 45,
      fats: 8,
      prepTime: 10,
      tags: ['vegetarian', 'quick', 'breakfast'],
    },
  ],
  keto: [
    {
      id: 4,
      name: 'Keto Chicken Caesar Salad',
      description: 'Grilled chicken with romaine, parmesan, and keto-friendly caesar dressing',
      ingredients: ['chicken breast', 'romaine lettuce', 'parmesan', 'olive oil', 'lemon'],
      calories: 420,
      protein: 35,
      carbs: 6,
      fats: 28,
      prepTime: 20,
      tags: ['keto', 'low-carb', 'high-protein'],
    },
    {
      id: 5,
      name: 'Avocado Egg Bowl',
      description: 'Scrambled eggs with avocado, bacon, and cheese',
      ingredients: ['eggs', 'avocado', 'bacon', 'cheddar cheese'],
      calories: 480,
      protein: 28,
      carbs: 8,
      fats: 36,
      prepTime: 15,
      tags: ['keto', 'breakfast', 'high-protein'],
    },
    {
      id: 6,
      name: 'Salmon with Asparagus',
      description: 'Pan-seared salmon with roasted asparagus and lemon butter',
      ingredients: ['salmon', 'asparagus', 'butter', 'lemon', 'garlic'],
      calories: 450,
      protein: 38,
      carbs: 5,
      fats: 30,
      prepTime: 25,
      tags: ['keto', 'low-carb', 'high-protein'],
    },
  ],
  'gluten-free': [
    {
      id: 7,
      name: 'Grilled Chicken & Rice',
      description: 'Herb-marinated chicken with jasmine rice and steamed vegetables',
      ingredients: ['chicken breast', 'jasmine rice', 'broccoli', 'carrots', 'soy sauce'],
      calories: 520,
      protein: 42,
      carbs: 55,
      fats: 12,
      prepTime: 35,
      tags: ['gluten-free', 'high-protein'],
    },
    {
      id: 8,
      name: 'Shrimp Tacos (Corn Tortillas)',
      description: 'Spiced shrimp with avocado, cabbage slaw, and lime',
      ingredients: ['shrimp', 'corn tortillas', 'avocado', 'cabbage', 'lime', 'cilantro'],
      calories: 380,
      protein: 32,
      carbs: 42,
      fats: 12,
      prepTime: 20,
      tags: ['gluten-free', 'quick', 'high-protein'],
    },
    {
      id: 9,
      name: 'Berry Chia Pudding',
      description: 'Creamy chia pudding topped with fresh berries',
      ingredients: ['chia seeds', 'coconut milk', 'berries', 'honey', 'vanilla'],
      calories: 280,
      protein: 10,
      carbs: 35,
      fats: 12,
      prepTime: 5,
      tags: ['gluten-free', 'vegetarian', 'breakfast'],
    },
  ],
};

// Common grocery items
const COMMON_GROCERY_ITEMS = [
  'chicken', 'salmon', 'eggs', 'quinoa', 'rice', 'lentils', 'chickpeas',
  'tomatoes', 'onions', 'garlic', 'bell peppers', 'broccoli', 'spinach',
  'avocado', 'cheese', 'yogurt', 'bread', 'pasta', 'olive oil', 'butter',
  'coconut milk', 'berries', 'bananas', 'apples', 'carrots', 'zucchini',
  'mushrooms', 'potatoes', 'sweet potatoes', 'beans', 'corn', 'lettuce',
];

export default function RecipeLabPage() {
  const { user, loading, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('personalized'); // 'personalized' or 'grocery'
  const [dietPreference, setDietPreference] = useState(userProfile?.dietPreference || 'vegetarian');
  const [calorieGoal, setCalorieGoal] = useState(userProfile?.calorieGoal || '2000');
  const [proteinGoal, setProteinGoal] = useState(userProfile?.proteinGoal || '150');
  const [selectedGroceries, setSelectedGroceries] = useState([]);
  const [grocerySearch, setGrocerySearch] = useState('');
  const [personalizedRecipes, setPersonalizedRecipes] = useState([]);
  const [groceryRecipes, setGroceryRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (activeTab === 'personalized') {
      generatePersonalizedRecipes();
    }
  }, [dietPreference, calorieGoal, proteinGoal, activeTab]);

  useEffect(() => {
    if (activeTab === 'grocery' && selectedGroceries.length > 0) {
      generateGroceryRecipes();
    } else if (activeTab === 'grocery') {
      setGroceryRecipes([]);
    }
  }, [selectedGroceries, activeTab]);

  const generatePersonalizedRecipes = () => {
    setLoadingRecipes(true);
    // Simulate API call delay
    setTimeout(() => {
      const recipes = RECIPE_DATABASE[dietPreference] || [];
      
      // Filter and score recipes based on goals
      const scoredRecipes = recipes.map(recipe => {
        let score = 0;
        const targetCalories = parseInt(calorieGoal);
        const targetProtein = parseInt(proteinGoal);
        
        // Score based on calorie proximity (prefer recipes close to target/3 for a meal)
        const mealTarget = targetCalories / 3;
        const calorieDiff = Math.abs(recipe.calories - mealTarget);
        score += Math.max(0, 100 - (calorieDiff / mealTarget * 100));
        
        // Score based on protein (prefer high protein if goal is high)
        if (targetProtein > 120) {
          score += (recipe.protein / 50) * 30;
        }
        
        return { ...recipe, score };
      }).sort((a, b) => b.score - a.score);
      
      setPersonalizedRecipes(scoredRecipes);
      setLoadingRecipes(false);
    }, 500);
  };

  const generateGroceryRecipes = () => {
    setLoadingRecipes(true);
    setTimeout(() => {
      const allRecipes = Object.values(RECIPE_DATABASE).flat();
      const lowerGroceries = selectedGroceries.map(g => g.toLowerCase().trim());
      
      // Find recipes that match selected groceries
      const matchingRecipes = allRecipes
        .map(recipe => {
          // Check each ingredient against each grocery item
          const matchingIngredients = recipe.ingredients.filter(ing => {
            const lowerIng = ing.toLowerCase().trim();
            return lowerGroceries.some(grocery => {
              // Check if ingredient contains grocery OR grocery contains ingredient (for partial matches)
              return lowerIng.includes(grocery) || grocery.includes(lowerIng) || 
                     lowerIng.split(/[\s,]+/).includes(grocery) ||
                     grocery.split(/[\s,]+/).some(g => lowerIng.includes(g));
            });
          });
          
          // Calculate match score: consider both percentage and absolute matches
          const matchPercentage = matchingIngredients.length / recipe.ingredients.length;
          const absoluteMatches = matchingIngredients.length;
          const groceryMatchRatio = matchingIngredients.length / selectedGroceries.length;
          
          // Combined score: prioritize recipes with more matches and higher percentage
          const matchScore = (matchPercentage * 0.4) + (absoluteMatches * 0.1) + (groceryMatchRatio * 0.5);
          
          return { ...recipe, matchScore, matchingIngredients, matchPercentage, absoluteMatches };
        })
        .filter(recipe => recipe.absoluteMatches > 0) // Show any recipe with at least 1 match
        .sort((a, b) => {
          // Sort by absolute matches first, then by match score
          if (b.absoluteMatches !== a.absoluteMatches) {
            return b.absoluteMatches - a.absoluteMatches;
          }
          return b.matchScore - a.matchScore;
        })
        .slice(0, 12); // Show top 12 matches
      
      setGroceryRecipes(matchingRecipes);
      setLoadingRecipes(false);
    }, 500);
  };

  const addGrocery = (item) => {
    if (!selectedGroceries.includes(item) && item.trim()) {
      setSelectedGroceries([...selectedGroceries, item.trim()]);
      setGrocerySearch('');
    }
  };

  const removeGrocery = (item) => {
    setSelectedGroceries(selectedGroceries.filter(g => g !== item));
  };

  const filteredGroceryItems = COMMON_GROCERY_ITEMS.filter(item =>
    item.toLowerCase().includes(grocerySearch.toLowerCase()) &&
    !selectedGroceries.includes(item)
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ChefHat className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Recipe Lab</h1>
          </div>
          <p className="text-gray-600">Discover personalized recipes based on your preferences and available ingredients</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('personalized')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'personalized'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Target className="inline h-4 w-4 mr-2" />
                Personalized Suggestions
              </button>
              <button
                onClick={() => setActiveTab('grocery')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'grocery'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ShoppingCart className="inline h-4 w-4 mr-2" />
                Recipe from Groceries
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'personalized' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diet Preference
                    </label>
                    <select
                      value={dietPreference}
                      onChange={(e) => setDietPreference(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="vegetarian">Vegetarian</option>
                      <option value="keto">Keto</option>
                      <option value="gluten-free">Gluten-Free</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Calorie Goal
                    </label>
                    <input
                      type="number"
                      value={calorieGoal}
                      onChange={(e) => setCalorieGoal(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="2000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Protein Goal (g)
                    </label>
                    <input
                      type="number"
                      value={proteinGoal}
                      onChange={(e) => setProteinGoal(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="150"
                    />
                  </div>
                </div>

                {loadingRecipes ? (
                  <div className="text-center py-12">
                    <Sparkles className="h-12 w-12 text-green-600 mx-auto animate-pulse" />
                    <p className="mt-4 text-gray-600">Generating personalized recipes...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {personalizedRecipes.map((recipe) => (
                      <div key={recipe.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{recipe.name}</h3>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {recipe.prepTime} min
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{recipe.description}</p>
                        
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-700 mb-2">Key Ingredients:</p>
                          <div className="flex flex-wrap gap-2">
                            {recipe.ingredients.slice(0, 4).map((ing, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>{recipe.calories} cal</span>
                            <span>P: {recipe.protein}g</span>
                            <span>C: {recipe.carbs}g</span>
                            <span>F: {recipe.fats}g</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Grocery Items
                  </label>
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={grocerySearch}
                        onChange={(e) => setGrocerySearch(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && grocerySearch.trim()) {
                            e.preventDefault();
                            addGrocery(grocerySearch);
                          }
                        }}
                        placeholder="Search or type grocery items..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                      />
                      {filteredGroceryItems.length > 0 && grocerySearch && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {filteredGroceryItems.slice(0, 8).map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => addGrocery(item)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-200 text-sm"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (grocerySearch.trim()) addGrocery(grocerySearch);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </button>
                  </div>

                  {selectedGroceries.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedGroceries.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {item}
                          <button
                            onClick={() => removeGrocery(item)}
                            className="hover:text-green-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {loadingRecipes ? (
                  <div className="text-center py-12">
                    <Sparkles className="h-12 w-12 text-green-600 mx-auto animate-pulse" />
                    <p className="mt-4 text-gray-600">Finding recipes for your groceries...</p>
                  </div>
                ) : selectedGroceries.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Add grocery items to find matching recipes</p>
                  </div>
                ) : groceryRecipes.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No recipes found matching your groceries. Try adding more items!</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Found {groceryRecipes.length} recipe{groceryRecipes.length !== 1 ? 's' : ''} matching your ingredients
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groceryRecipes.map((recipe) => (
                        <div key={recipe.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">{recipe.name}</h3>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {recipe.absoluteMatches} match{recipe.absoluteMatches !== 1 ? 'es' : ''} ({Math.round(recipe.matchPercentage * 100)}%)
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{recipe.description}</p>
                          
                          <div className="mb-4">
                            <p className="text-xs font-medium text-gray-700 mb-2">Matching Ingredients:</p>
                            <div className="flex flex-wrap gap-2">
                              {recipe.matchingIngredients.map((ing, idx) => (
                                <span key={idx} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  {ing}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span>{recipe.calories} cal</span>
                              <span>P: {recipe.protein}g</span>
                              <span>C: {recipe.carbs}g</span>
                              <span>F: {recipe.fats}g</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
