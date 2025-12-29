import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import {
  Utensils,
  Plus,
  Edit2,
  ShoppingCart,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { calculateCalorieGoal } from '../lib/calculations';
import { generateMealPlanFromAPI, getMealOptions, transformRecipe } from '../lib/services/recipeService';
import { generateGroceryList } from '../lib/services/groceryService';
import axios from 'axios';

export default function MealPlansPage() {
  const { user, loading, userProfile } = useAuth();
  const navigate = useNavigate();
  const [dietPreference, setDietPreference] = useState('vegetarian');
  const [calorieTarget, setCalorieTarget] = useState('');
  const [planDuration, setPlanDuration] = useState(3);
  const [mealPlan, setMealPlan] = useState([]);
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [activeDay, setActiveDay] = useState(null);
  const [activeMealType, setActiveMealType] = useState(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [smartShopping, setSmartShopping] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [mealOptions, setMealOptions] = useState([]);
  const [loadingMealOptions, setLoadingMealOptions] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (userProfile && !calorieTarget) {
      const calculatedGoal = calculateCalorieGoal(userProfile);
      setCalorieTarget(calculatedGoal.toString());
    }
  }, [userProfile]);

  const generateMealPlan = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const target = parseInt(calorieTarget, 10) || calculateCalorieGoal(userProfile);

      if (!target || target < 1200) {
        throw new Error('Please enter a valid calorie target (minimum 1200 calories)');
      }

      const plan = await generateMealPlanFromAPI(dietPreference, target, planDuration);
      setMealPlan(plan);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      setError(error.message || 'Failed to generate meal plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMealClick = async (dayIndex, mealType) => {
    setActiveDay(dayIndex);
    setActiveMealType(mealType);
    setShowMealSelector(true);
    setLoadingMealOptions(true);
    setError(null);

    try {
      const target = parseInt(calorieTarget, 10) || calculateCalorieGoal(userProfile);
      const caloriesPerMeal = {
        breakfast: Math.round(target * 0.25),
        lunch: Math.round(target * 0.35),
        dinner: Math.round(target * 0.30),
        snack: Math.round(target * 0.10),
      };

      const options = await getMealOptions(
        dietPreference,
        mealType,
        caloriesPerMeal[mealType] + 100
      );
      setMealOptions(options);
    } catch (error) {
      console.error('Error fetching meal options:', error);
      setError(error.message || 'Failed to load meal options');
    } finally {
      setLoadingMealOptions(false);
    }
  };

  const replaceMeal = (dayIndex, mealType, newMeal) => {
    const updatedPlan = [...mealPlan];
    const target = parseInt(calorieTarget, 10) || calculateCalorieGoal(userProfile);

    const caloriesPerMeal = {
      breakfast: Math.round(target * 0.25),
      lunch: Math.round(target * 0.35),
      dinner: Math.round(target * 0.30),
      snack: Math.round(target * 0.10),
    };

    const targetCalories = caloriesPerMeal[mealType];

    // Scale meal to match target
    if (newMeal.calories > 0) {
      const scale = targetCalories / newMeal.calories;
      newMeal.calories = Math.round(newMeal.calories * scale);
      newMeal.protein = Math.round(newMeal.protein * scale);
      newMeal.carbs = Math.round(newMeal.carbs * scale);
      newMeal.fats = Math.round(newMeal.fats * scale);
    }

    updatedPlan[dayIndex].meals[mealType] = newMeal;
    setMealPlan(updatedPlan);
    setShowMealSelector(false);
    setMealOptions([]);
  };

  const generateShoppingList = () => {
    const ingredients = new Map();

    mealPlan.forEach(day => {
      Object.values(day.meals).forEach(meal => {
        if (meal?.ingredients) {
          meal.ingredients.forEach(ingredient => {
            const count = ingredients.get(ingredient) || 0;
            ingredients.set(ingredient, count + 1);
          });
        }
      });
    });

    return Array.from(ingredients.entries())
      .map(([ingredient, count]) => ({ ingredient, count }))
      .sort((a, b) => a.ingredient.localeCompare(b.ingredient));
  };

  useEffect(() => {
    const run = async () => {
      if (mealPlan.length === 0) {
        setSmartShopping(null);
        return;
      }
      try {
        const data = await generateGroceryList(mealPlan);
        setSmartShopping(data?.categories || null);
      } catch (e) {
        setSmartShopping(null);
      }
    };
    run();
  }, [mealPlan]);

  const getWeeklyNutrition = () => {
    const totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };

    mealPlan.forEach(day => {
      Object.values(day.meals).forEach(meal => {
        if (meal) {
          totals.calories += meal.calories || 0;
          totals.protein += meal.protein || 0;
          totals.carbs += meal.carbs || 0;
          totals.fats += meal.fats || 0;
        }
      });
    });

    return {
      daily: {
        calories: Math.round(totals.calories / planDuration),
        protein: Math.round(totals.protein / planDuration),
        carbs: Math.round(totals.carbs / planDuration),
        fats: Math.round(totals.fats / planDuration),
      },
      weekly: totals,
    };
  };

  const saveMealPlan = async () => {
    try {
      const planData = {
        userId: user.uid,
        name: `${dietPreference} Plan - ${new Date().toLocaleDateString()}`,
        dietPreference,
        calorieTarget: parseInt(calorieTarget, 10),
        duration: planDuration,
        meals: mealPlan,
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage for now
      const saved = JSON.parse(localStorage.getItem('savedMealPlans') || '[]');
      saved.push({ ...planData, id: Date.now().toString() });
      localStorage.setItem('savedMealPlans', JSON.stringify(saved));

      alert('Meal plan saved successfully!');
    } catch (error) {
      console.error('Error saving meal plan:', error);
      alert('Failed to save meal plan');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const nutrition = mealPlan.length > 0 ? getWeeklyNutrition() : null;
  const shoppingList = mealPlan.length > 0 ? generateShoppingList() : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Meal Plans</p>
            <h1 className="text-3xl font-bold text-gray-900">
              {userProfile?.name ? `${userProfile.name}'s Meal Plans` : 'Your Meal Plans'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">Create personalized weekly meal plans using real recipes</p>
          </div>
          <Utensils className="h-8 w-8 text-green-600" />
        </div>

        {/* API Key Warning */}
        {!import.meta.env.VITE_SPOONACULAR_API_KEY && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">API Key Required</p>
              <p className="text-sm text-yellow-700 mt-1">
                Please add <code className="bg-yellow-100 px-1 rounded">VITE_SPOONACULAR_API_KEY</code> to your <code className="bg-yellow-100 px-1 rounded">.env</code> file.
                Get a free API key from{' '}
                <a href="https://spoonacular.com/food-api" target="_blank" rel="noopener noreferrer" className="underline">
                  Spoonacular API
                </a>
                {' '}(150 free requests/day).
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Plan Generator */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Diet Preference</label>
              <select
                value={dietPreference}
                onChange={(e) => setDietPreference(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isGenerating}
              >
                <option value="vegetarian">Vegetarian</option>
                <option value="keto">Keto</option>
                <option value="gluten-free">Gluten-Free</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Calorie Target</label>
              <input
                type="number"
                min="1200"
                step="50"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="2000"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan Duration</label>
              <select
                value={planDuration}
                onChange={(e) => setPlanDuration(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isGenerating}
              >
                <option value="1">1 Day</option>
                <option value="2">2 Days</option>
                <option value="3">3 Days</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={generateMealPlan}
                disabled={isGenerating || !import.meta.env.VITE_SPOONACULAR_API_KEY}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Plan'
                )}
              </button>
            </div>
          </div>

          {nutrition && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Daily Avg Calories</p>
                  <p className="text-lg font-semibold text-gray-900">{nutrition.daily.calories}</p>
                </div>
                <div>
                  <p className="text-gray-600">Daily Avg Protein</p>
                  <p className="text-lg font-semibold text-gray-900">{nutrition.daily.protein}g</p>
                </div>
                <div>
                  <p className="text-gray-600">Daily Avg Carbs</p>
                  <p className="text-lg font-semibold text-gray-900">{nutrition.daily.carbs}g</p>
                </div>
                <div>
                  <p className="text-gray-600">Daily Avg Fats</p>
                  <p className="text-lg font-semibold text-gray-900">{nutrition.daily.fats}g</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Meal Plan Display */}
        {mealPlan.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Meal Plan</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowShoppingList(!showShoppingList)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Shopping List
                </button>
                <button
                  onClick={saveMealPlan}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Save className="h-4 w-4" />
                  Save Plan
                </button>
              </div>
            </div>

            {showShoppingList && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Shopping List</h3>
                {smartShopping ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(smartShopping).map(([category, items]) => (
                      <div key={category} className="bg-white border border-gray-200 rounded p-3">
                        <p className="text-sm font-semibold text-gray-800 mb-2 capitalize">{category}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {items.map((it, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>{it.name}</span>
                              {it.count > 1 && <span className="text-gray-500">({it.count}x)</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {shoppingList.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{item.ingredient}</span>
                        {item.count > 1 && <span className="text-gray-500">({item.count}x)</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              {mealPlan.map((day, dayIndex) => (
                <div key={dayIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Day {day.day}</h3>
                      <p className="text-sm text-gray-600">{day.date}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {Object.values(day.meals).reduce((sum, meal) => sum + (meal?.calories || 0), 0)} kcal
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                      const meal = day.meals[mealType];
                      return (
                        <div
                          key={mealType}
                          className="bg-gray-50 rounded-md p-3 hover:bg-gray-100 transition-colors cursor-pointer relative group"
                          onClick={() => handleMealClick(dayIndex, mealType)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-medium text-gray-500 uppercase">{mealType}</p>
                            <Edit2 className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {meal ? (
                            <>
                              {meal.image && (
                                <img
                                  src={meal.image}
                                  alt={meal.name}
                                  className="w-full h-24 object-cover rounded mb-2"
                                />
                              )}
                              <p className="font-medium text-gray-900 text-sm mb-1">{meal.name}</p>
                              <p className="text-xs text-gray-600 mb-2">{meal.prepTime} min</p>
                              <div className="text-xs text-gray-600 space-y-0.5">
                                <p>{meal.calories} cal</p>
                                <p>P: {meal.protein}g · C: {meal.carbs}g · F: {meal.fats}g</p>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-4 text-gray-400">
                              <Plus className="h-6 w-6 mx-auto mb-1" />
                              <p className="text-xs">Add meal</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meal Selector Modal */}
        {showMealSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Select {activeMealType} for Day {activeDay !== null ? activeDay + 1 : ''}
                </h3>
                <button
                  onClick={() => {
                    setShowMealSelector(false);
                    setMealOptions([]);
                    setError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                {loadingMealOptions ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                    <span className="ml-3 text-gray-600">Loading meal options...</span>
                  </div>
                ) : mealOptions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mealOptions.map((meal) => (
                      <div
                        key={meal.id}
                        onClick={() => replaceMeal(activeDay, activeMealType, meal)}
                        className="border border-gray-200 rounded-lg p-3 hover:border-green-500 hover:bg-green-50 cursor-pointer transition-colors"
                      >
                        {meal.image && (
                          <img
                            src={meal.image}
                            alt={meal.name}
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                        )}
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-gray-900">{meal.name}</p>
                          <span className="text-xs text-gray-500">{meal.prepTime} min</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {meal.calories} cal · P: {meal.protein}g · C: {meal.carbs}g · F: {meal.fats}g
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {meal.ingredients.slice(0, 4).map((ing, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>No meal options available. Please try again.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {mealPlan.length === 0 && !isGenerating && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Set your preferences and generate a meal plan to get started.</p>
            {!import.meta.env.VITE_SPOONACULAR_API_KEY && (
              <p className="text-sm text-amber-600 mt-2">
                Don't forget to add your Spoonacular API key to enable meal generation.
              </p>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
