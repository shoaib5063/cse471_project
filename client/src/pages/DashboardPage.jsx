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
} from 'lucide-react';
import axios from 'axios';

const DIET_TEMPLATES = {
  vegetarian: [
    { mealType: 'breakfast', mealName: 'Greek Yogurt Parfait', calories: 350, protein: 20, carbs: 45, fats: 10 },
    { mealType: 'lunch', mealName: 'Quinoa Veggie Bowl', calories: 500, protein: 22, carbs: 60, fats: 18 },
    { mealType: 'dinner', mealName: 'Lentil Curry with Rice', calories: 550, protein: 25, carbs: 70, fats: 15 },
    { mealType: 'snack', mealName: 'Hummus & Veggies', calories: 200, protein: 6, carbs: 20, fats: 12 },
  ],
  keto: [
    { mealType: 'breakfast', mealName: 'Avocado Omelette', calories: 420, protein: 24, carbs: 8, fats: 32 },
    { mealType: 'lunch', mealName: 'Chicken Caesar Salad', calories: 480, protein: 35, carbs: 10, fats: 30 },
    { mealType: 'dinner', mealName: 'Salmon with Asparagus', calories: 520, protein: 40, carbs: 6, fats: 32 },
    { mealType: 'snack', mealName: 'Mixed Nuts', calories: 200, protein: 6, carbs: 6, fats: 18 },
  ],
  'gluten-free': [
    { mealType: 'breakfast', mealName: 'Berry Chia Pudding', calories: 360, protein: 12, carbs: 48, fats: 14 },
    { mealType: 'lunch', mealName: 'Grilled Chicken & Rice', calories: 520, protein: 42, carbs: 55, fats: 14 },
    { mealType: 'dinner', mealName: 'Shrimp Tacos (corn tortillas)', calories: 540, protein: 35, carbs: 52, fats: 20 },
    { mealType: 'snack', mealName: 'Apple with Peanut Butter', calories: 210, protein: 7, carbs: 24, fats: 11 },
  ],
};

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [dietPreference, setDietPreference] = useState('vegetarian');
  const [calorieTarget, setCalorieTarget] = useState('2000');
  const sections = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'meal-tracking', label: 'Meal Tracking', icon: ClipboardList, to: '/dashboard/meal-tracking' },
    { id: 'meal-plans', label: 'Meal Plans', icon: Utensils, to: '/dashboard/meal-plans' },
    { id: 'recipe-lab', label: 'Recipe Lab', icon: ChefHat, to: '/dashboard/recipe-lab' },
    { id: 'health-tips', label: 'Health Tips', icon: Lightbulb, to: '/dashboard/health-tips' },
  ];

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
                      {meals.reduce((sum, meal) => sum + (parseInt(meal.calories) || 0), 0)}
                    </p>
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
