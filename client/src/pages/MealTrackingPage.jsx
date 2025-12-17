import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MoodTracker from '../components/MoodTracker';
import { Plus, Search, X, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function MealTrackingPage() {
  const { user, loading, userProfile } = useAuth();
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState([]);

  // NEW: Mood tracking states
  const [moodBefore, setMoodBefore] = useState(null);
  const [moodAfter, setMoodAfter] = useState(null);
  const [moodNotes, setMoodNotes] = useState('');

  const [newMeal, setNewMeal] = useState({
    mealName: '',
    mealType: 'breakfast',
    mealDate: new Date().toISOString().split('T')[0], // Default to today
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
  });

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && user.uid) {
      fetchMeals();
    }
  }, [user]);

  const fetchMeals = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/meals/user/${user.uid}`);
      // Sort by date descending
      const sortedMeals = (response.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
      setMeals(sortedMeals);
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

  const searchFood = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/meals/search?query=${query}`
      );
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Error searching food:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchFood(query);
  };

  const addFoodToMeal = (food) => {
    const newFood = {
      fdcId: food.fdcId,
      description: food.description,
      quantity: 1,
      servingSize: food.servingSize,
      servingSizeUnit: food.servingSizeUnit,
      nutrients: food.nutrients
    };

    setSelectedFoods([...selectedFoods, newFood]);

    // Calculate total nutrition
    const totalNutrition = [...selectedFoods, newFood].reduce((acc, f) => {
      const multiplier = f.quantity || 1;
      return {
        calories: acc.calories + (f.nutrients.calories * multiplier),
        protein: acc.protein + (f.nutrients.protein * multiplier),
        carbs: acc.carbs + (f.nutrients.carbs * multiplier),
        fat: acc.fat + (f.nutrients.fat * multiplier),
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    setNewMeal({
      ...newMeal,
      calories: Math.round(totalNutrition.calories).toString(),
      protein: Math.round(totalNutrition.protein).toString(),
      carbs: Math.round(totalNutrition.carbs).toString(),
      fats: Math.round(totalNutrition.fat).toString(),
    });

    setSearchQuery('');
    setSearchResults([]);
  };

  const removeFoodFromMeal = (index) => {
    const updatedFoods = selectedFoods.filter((_, i) => i !== index);
    setSelectedFoods(updatedFoods);

    const totalNutrition = updatedFoods.reduce((acc, f) => {
      const multiplier = f.quantity || 1;
      return {
        calories: acc.calories + (f.nutrients.calories * multiplier),
        protein: acc.protein + (f.nutrients.protein * multiplier),
        carbs: acc.carbs + (f.nutrients.carbs * multiplier),
        fat: acc.fat + (f.nutrients.fat * multiplier),
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    setNewMeal({
      ...newMeal,
      calories: Math.round(totalNutrition.calories).toString(),
      protein: Math.round(totalNutrition.protein).toString(),
      carbs: Math.round(totalNutrition.carbs).toString(),
      fats: Math.round(totalNutrition.fat).toString(),
    });
  };

  const handleMoodChange = (field, value) => {
    if (field === 'moodBefore') setMoodBefore(value);
    else if (field === 'moodAfter') setMoodAfter(value);
    else if (field === 'moodNotes') setMoodNotes(value);
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/meals`, {
        userId: user.uid,
        mealName: newMeal.mealName,
        mealType: newMeal.mealType,
        date: newMeal.mealDate, // Use selected date
        nutrition: {
          calories: parseFloat(newMeal.calories) || 0,
          protein: parseFloat(newMeal.protein) || 0,
          carbs: parseFloat(newMeal.carbs) || 0,
          fat: parseFloat(newMeal.fats) || 0,
          fiber: 0,
          sugar: 0
        },
        foodItems: selectedFoods.map(f => ({
          fdcId: f.fdcId,
          description: f.description,
          quantity: f.quantity || 1,
          servingSize: f.servingSize,
          servingSizeUnit: f.servingSizeUnit
        })),
        moodBefore,
        moodAfter,
        moodNotes
      });

      setShowAddMeal(false);
      setNewMeal({
        mealName: '',
        mealType: 'breakfast',
        mealDate: new Date().toISOString().split('T')[0],
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
      });
      setSelectedFoods([]);
      setSearchQuery('');
      setSearchResults([]);
      setMoodBefore(null);
      setMoodAfter(null);
      setMoodNotes('');

      fetchMeals();
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  };

  const getMoodEmoji = (mood) => {
    const emojiMap = {
      'very_bad': '😞',
      'bad': '😕',
      'neutral': '😐',
      'good': '😊',
      'excellent': '😄'
    };
    return emojiMap[mood] || '';
  };

  // Group meals by date
  const groupedMeals = meals.reduce((groups, meal) => {
    const date = new Date(meal.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(meal);
    return groups;
  }, {});

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Meal Tracker</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {userProfile?.name ? `${userProfile.name}'s Meals` : 'Your Meals'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Log your nutrition and track your mood journey.</p>
          </div>
          <button
            onClick={() => setShowAddMeal(true)}
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 mt-4 sm:mt-0 font-medium"
          >
            <Plus className="h-5 w-5 mr-2" />
            Log Meal
          </button>
        </div>

        <AnimatePresence>
          {showAddMeal && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100"
            >
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Add New Meal</h3>
                <button onClick={() => setShowAddMeal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-6 py-6">
                <form onSubmit={handleAddMeal} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          value={newMeal.mealDate}
                          onChange={(e) => setNewMeal({ ...newMeal, mealDate: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                      <select
                        value={newMeal.mealType}
                        onChange={(e) => setNewMeal({ ...newMeal, mealType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meal Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Avocado Toast"
                        value={newMeal.mealName}
                        onChange={(e) => setNewMeal({ ...newMeal, mealName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Food Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Add Foods (USDS Database)</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search for foods..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm"
                      />

                      {searching && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                        </div>
                      )}

                      {searchResults.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                          {searchResults.map((food) => (
                            <button
                              key={food.fdcId}
                              type="button"
                              onClick={() => addFoodToMeal(food)}
                              className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-100 last:border-0 transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-900">{food.description}</p>
                                  <p className="text-xs text-gray-500">{food.brandName} • {food.servingSize}{food.servingSizeUnit}</p>
                                </div>
                                <span className="text-sm font-semibold text-green-600">{food.nutrients.calories} cal</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected Foods List */}
                  {selectedFoods.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Selected Items</p>
                      <div className="space-y-2">
                        {selectedFoods.map((food, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                            <span className="text-sm font-medium text-gray-700">{food.description}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-gray-500">{Math.round(food.nutrients.calories)} cal</span>
                              <button
                                type="button"
                                onClick={() => removeFoodFromMeal(index)}
                                className="text-red-400 hover:text-red-600 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manual Macros Override */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nutrition Totals (Auto-calculated)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['calories', 'protein', 'carbs', 'fats'].map((nutrient) => (
                        <div key={nutrient} className="relative">
                          <input
                            type="number"
                            value={newMeal[nutrient]}
                            onChange={(e) => setNewMeal({ ...newMeal, [nutrient]: e.target.value })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
                            placeholder="0"
                          />
                          <span className="absolute right-3 top-2 text-xs text-gray-500 uppercase font-medium pointer-events-none">
                            {nutrient === 'calories' ? 'kcal' : 'g'}
                          </span>
                          <span className="block text-xs text-gray-500 mt-1 capitalize">{nutrient}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <p className="block text-sm font-medium text-gray-700 mb-4">Mood & Reflection</p>
                    <MoodTracker
                      moodBefore={moodBefore}
                      moodAfter={moodAfter}
                      moodNotes={moodNotes}
                      onMoodChange={handleMoodChange}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowAddMeal(false)}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md font-medium transition-colors"
                    >
                      Save Meal
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-8">
          {Object.keys(groupedMeals).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900">No meals logged yet</p>
              <p className="text-gray-500 mt-1">Start tracking your nutrition journey today!</p>
            </div>
          ) : (
            Object.entries(groupedMeals).map(([date, dayMeals]) => (
              <div key={date} className="animate-fade-in">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-lg font-bold text-gray-800 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 inline-block">
                    {date}
                  </h2>
                  <div className="h-px bg-gray-200 flex-grow"></div>
                </div>

                <div className="grid gap-4">
                  {dayMeals.map((meal, index) => (
                    <div
                      key={index}
                      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide
                              ${meal.mealType === 'breakfast' ? 'bg-orange-100 text-orange-700' :
                                meal.mealType === 'lunch' ? 'bg-blue-100 text-blue-700' :
                                  meal.mealType === 'dinner' ? 'bg-purple-100 text-purple-700' :
                                    'bg-gray-100 text-gray-700'}`}
                            >
                              {meal.mealType}
                            </span>
                            <h3 className="font-bold text-gray-900 text-lg">{meal.mealName}</h3>
                          </div>

                          {/* Mood Indicators */}
                          {(meal.moodBefore || meal.moodAfter || meal.moodNotes) && (
                            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm bg-purple-50 p-3 rounded-lg border border-purple-100">
                              {meal.moodBefore && (
                                <span className="flex items-center text-purple-800">
                                  <span className="text-gray-500 mr-2">Before:</span>
                                  <span className="text-lg mr-1">{getMoodEmoji(meal.moodBefore)}</span>
                                  <span className="capitalize font-medium">{meal.moodBefore?.replace('_', ' ')}</span>
                                </span>
                              )}
                              {meal.moodAfter && (
                                <span className="flex items-center text-purple-800">
                                  <span className="text-gray-500 mr-2">After:</span>
                                  <span className="text-lg mr-1">{getMoodEmoji(meal.moodAfter)}</span>
                                  <span className="capitalize font-medium">{meal.moodAfter?.replace('_', ' ')}</span>
                                </span>
                              )}
                              {meal.moodNotes && (
                                <p className="text-purple-700 italic border-l-2 border-purple-200 pl-3 w-full mt-1">
                                  "{meal.moodNotes}"
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-6 sm:text-right border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                          <div>
                            <p className="text-2xl font-bold text-gray-900">{meal.nutrition?.calories || 0}</p>
                            <p className="text-xs text-gray-500 font-medium uppercase">Calories</p>
                          </div>
                          <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                          <div className="space-y-1 min-w-[100px]">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Protein</span>
                              <span className="font-medium text-gray-900">{meal.nutrition?.protein || 0}g</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Carbs</span>
                              <span className="font-medium text-gray-900">{meal.nutrition?.carbs || 0}g</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Fats</span>
                              <span className="font-medium text-gray-900">{meal.nutrition?.fat || 0}g</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
