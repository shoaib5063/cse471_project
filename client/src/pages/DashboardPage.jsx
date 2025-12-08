import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Plus, Utensils, TrendingUp } from 'lucide-react';
import axios from 'axios';

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [showAddMeal, setShowAddMeal] = useState(false);
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
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/meals?userId=${user.uid}`);
      setMeals(response.data.data || []);
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/meals`, {
        userId: user.uid,
        ...newMeal,
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
                  {meals.reduce((sum, meal) => sum + (parseInt(meal.calories) || 0), 0)}
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
                    placeholder="Meal Name"
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
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddMeal(false)}
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
                {meals.map((meal, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">{meal.mealName}</h3>
                      <p className="text-sm text-gray-600 capitalize">{meal.mealType}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{meal.calories} cal</p>
                      <p className="text-sm text-gray-600">
                        P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fats}g
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
