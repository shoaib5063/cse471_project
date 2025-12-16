import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import {
  Plus,
  Utensils,
  TrendingUp,
  LayoutGrid,
  ClipboardList,
  ChefHat,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import axios from 'axios';

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);

  const sections = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'meal-tracking', label: 'Meal Tracking', icon: ClipboardList, to: '/dashboard/meal-tracking' },
    { id: 'meal-plans', label: 'Meal Plans', icon: Utensils, to: '/dashboard/meal-plans' },
    { id: 'recipe-lab', label: 'Recipe Lab', icon: ChefHat, to: '/dashboard/recipe-lab' },
    { id: 'health-tips', label: 'Health Tips', icon: Lightbulb, to: '/dashboard/health-tips' },
    { id: 'questions', label: 'Health Q&A', icon: MessageSquare, to: '/dashboard/questions' },
  ];

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const [summary, setSummary] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    hydration: 0
  });

  useEffect(() => {
    if (user) {
      fetchMeals();
      fetchSummary();
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
      setMeals([]);
    }
  };

  const fetchSummary = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/meals/summary/${user.uid}?date=${today}`
      );
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const logWater = async (amount) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/hydration`, {
        userId: user.uid,
        amount
      });
      fetchSummary(); // Refresh summary
    } catch (error) {
      console.error('Error logging water:', error);
    }
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="bg-white rounded-lg shadow p-4 h-fit lg:sticky lg:top-20">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard</h2>
            <div className="space-y-2">
              {sections.map(({ id, label, icon: Icon, to }) => (
                <Link
                  key={id}
                  to={to || '#'}
                  className="flex w-full items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 text-left text-gray-800"
                >
                  <Icon className="h-4 w-4 text-green-600" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-8">
            <section id="overview" className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-sm text-gray-500">Welcome back</p>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {userProfile?.name ? `${userProfile.name}'s Dashboard` : 'Your Dashboard'}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">Navigate to each tool from the sidebar.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Meals logged</p>
                    <p className="text-xl font-semibold text-gray-900">{meals.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Calories today</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {meals.reduce((sum, meal) => sum + (meal.nutrition?.calories || parseInt(meal.calories) || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Daily Progress Section */}
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Progress</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Calories */}
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">Calories</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-orange-600">
                      {summary.calories}
                    </span>
                    <span className="text-sm text-orange-600 mb-1">kcal</span>
                  </div>
                  <div className="w-full bg-orange-200 h-2 rounded-full mt-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${Math.min((summary.calories / 2000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Hydration */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Hydration</h3>
                    {/* Simple Add Water Button */}
                    <button
                      onClick={() => logWater(250)}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition"
                    >
                      + 250ml
                    </button>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-blue-600">
                      {(summary.hydration / 1000).toFixed(1)}
                    </span>
                    <span className="text-sm text-blue-600 mb-1">L</span>
                  </div>
                  <div className="w-full bg-blue-200 h-2 rounded-full mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min((summary.hydration / 2000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-500 mt-2 text-right">{summary.hydration} / 2000 ml</p>
                </div>

                {/* Macros */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Nutrition</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Protein</span>
                      <span className="font-bold text-green-900">{summary.protein}g</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Carbs</span>
                      <span className="font-bold text-green-900">{summary.carbs}g</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Fat</span>
                      <span className="font-bold text-green-900">{summary.fat}g</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Meal Tracking</h3>
                    <p className="text-sm text-gray-600">Log and review meals.</p>
                  </div>
                  <ClipboardList className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-700">Go to dedicated meal tracking page.</p>
                <Link
                  to="/dashboard/meal-tracking"
                  className="inline-flex items-center mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Open Meal Tracking
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Meal Plans</h3>
                    <p className="text-sm text-gray-600">Build plans by diet.</p>
                  </div>
                  <Utensils className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-700">Use templates and calorie targets.</p>
                <Link
                  to="/dashboard/meal-plans"
                  className="inline-flex items-center mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Open Meal Plans
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Recipe Lab</h3>
                    <p className="text-sm text-gray-600">Ideas from your pantry.</p>
                  </div>
                  <ChefHat className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-700">Discover or create recipes.</p>
                <Link
                  to="/dashboard/recipe-lab"
                  className="inline-flex items-center mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Open Recipe Lab
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Health Tips</h3>
                    <p className="text-sm text-gray-600">Quick reminders.</p>
                  </div>
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                </div>
                <p className="text-sm text-gray-700">Stay on track with small habits.</p>
                <Link
                  to="/dashboard/health-tips"
                  className="inline-flex items-center mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  View Tips
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
