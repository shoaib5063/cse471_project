import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Plus, Utensils, TrendingUp, Search, X } from 'lucide-react';
import axios from 'axios';

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [newMeal, setNewMeal] = useState({
    mealName: '',
    mealType: 'breakfast',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMeals();
    }
  }, [user]);

  const fetchMeals = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/meals/user/${user.uid}?date=${today}`
      );
      setMeals(response.data || []);
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

    // Recalculate nutrition
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

  const handleAddMeal = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/meals/log`, {
        userId: user.uid,
        mealName: newMeal.mealName,
        mealType: newMeal.mealType,
        foodItems: selectedFoods,
        nutrition: {
          calories: parseInt(newMeal.calories) || 0,
          protein: parseInt(newMeal.protein) || 0,
          carbs: parseInt(newMeal.carbs) || 0,
          fat: parseInt(newMeal.fats) || 0,
          fiber: 0,
          sugar: 0
        },
        date: new Date().toISOString(),
      });
      
      setShowAddMeal(false);
      setNewMeal({
        mealName: '',
        mealType: 'breakfast',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
      });
      setSelectedFoods([]);
      setSearchQuery('');
      setSearchResults([]);
      fetchMeals();
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userProfile?.name || 'User'}!
          </h1>
          <p className="mt-2 text-gray-600">Track your meals and monitor your nutrition</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Utensils className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Today's Meals</p>
                <p className="text-2xl font-bold text-gray-900">{meals.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Calories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {meals.reduce((sum, meal) => sum + (meal.nutrition?.calories || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm text-gray-600">Goal Progress</p>
                <p className="text-2xl font-bold text-gray-900">75%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Meals</h2>
            <button
              onClick={() => setShowAddMeal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Meal
            </button>
          </div>

          {showAddMeal && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <form onSubmit={handleAddMeal} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Meal Name (e.g., Breakfast)"
                    value={newMeal.mealName}
                    onChange={(e) => setNewMeal({ ...newMeal, mealName: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <select
                    value={newMeal.mealType}
                    onChange={(e) => setNewMeal({ ...newMeal, mealType: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                {/* Food Search */}
                <div className="relative">
                  <div className="flex items-center">
                    <Search className="absolute left-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for foods (e.g., chicken, rice, apple)..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  {searching && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                      <p className="text-gray-500">Searching...</p>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto">
                      {searchResults.map((food) => (
                        <button
                          key={food.fdcId}
                          type="button"
                          onClick={() => addFoodToMeal(food)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-200"
                        >
                          <p className="font-medium text-gray-900">{food.description}</p>
                          <p className="text-sm text-gray-600">
                            {food.brandName} | {food.servingSize}{food.servingSizeUnit} | {food.nutrients.calories} cal
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Foods */}
                {selectedFoods.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Selected Foods:</p>
                    {selectedFoods.map((food, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                        <span className="text-sm">{food.description}</span>
                        <button
                          type="button"
                          onClick={() => removeFoodFromMeal(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Nutrition Info (Auto-calculated or Manual) */}
                <div className="grid grid-cols-4 gap-4">
                  <input
                    type="number"
                    placeholder="Calories"
                    value={newMeal.calories}
                    onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Protein (g)"
                    value={newMeal.protein}
                    onChange={(e) => setNewMeal({ ...newMeal, protein: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    placeholder="Carbs (g)"
                    value={newMeal.carbs}
                    onChange={(e) => setNewMeal({ ...newMeal, carbs: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    placeholder="Fats (g)"
                    value={newMeal.fats}
                    onChange={(e) => setNewMeal({ ...newMeal, fats: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Save Meal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMeal(false);
                      setSelectedFoods([]);
                      setSearchQuery('');
                      setSearchResults([]);
                      setNewMeal({
                        mealName: '',
                        mealType: 'breakfast',
                        calories: '',
                        protein: '',
                        carbs: '',
                        fats: '',
                      });
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="px-6 py-4">
            {meals.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No meals logged yet. Add your first meal!</p>
            ) : (
              <div className="space-y-4">
                {meals.map((meal) => (
                  <div key={meal._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">{meal.mealName}</h3>
                      <p className="text-sm text-gray-600 capitalize">{meal.mealType}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{meal.nutrition?.calories || 0} cal</p>
                      <p className="text-sm text-gray-600">
                        P: {meal.nutrition?.protein || 0}g | C: {meal.nutrition?.carbs || 0}g | F: {meal.nutrition?.fat || 0}g
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
