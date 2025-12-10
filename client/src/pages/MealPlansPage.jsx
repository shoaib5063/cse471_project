import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Utensils } from 'lucide-react';

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

export default function MealPlansPage() {
  const { user, loading, userProfile } = useAuth();
  const navigate = useNavigate();
  const [dietPreference, setDietPreference] = useState('vegetarian');
  const [calorieTarget, setCalorieTarget] = useState('2000');
  const [mealPlan, setMealPlan] = useState([]);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  const generateMealPlan = () => {
    const template = DIET_TEMPLATES[dietPreference] || [];
    const target = parseInt(calorieTarget, 10) || 2000;
    const baseCalories = template.reduce((sum, meal) => sum + meal.calories, 0) || 1;
    const scale = target / baseCalories;

    const plan = Array.from({ length: 3 }, (_, dayIndex) => ({
      day: `Day ${dayIndex + 1}`,
      meals: template.map((meal) => ({
        ...meal,
        calories: Math.round(meal.calories * scale),
        protein: Math.round(meal.protein * scale),
        carbs: Math.round(meal.carbs * scale),
        fats: Math.round(meal.fats * scale),
      })),
    }));

    setMealPlan(plan);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Meal Plans</p>
            <h1 className="text-3xl font-bold text-gray-900">
              {userProfile?.name ? `${userProfile.name}'s plans` : 'Your meal plans'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">Generate multi-day plans by preference.</p>
          </div>
          <Utensils className="h-8 w-8 text-green-600" />
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-700">Diet Preference</label>
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
            <div className="space-y-1">
              <label className="text-sm text-gray-700">Daily Calorie Target</label>
              <input
                type="number"
                min="1200"
                step="50"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g. 2000"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={generateMealPlan}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Generate Plan
              </button>
            </div>
          </div>

          {mealPlan.length > 0 ? (
            <div className="space-y-4">
              {mealPlan.map((day) => (
                <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-900">{day.day}</h3>
                    <span className="text-sm text-gray-600">
                      {day.meals.reduce((sum, meal) => sum + meal.calories, 0)} kcal
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {day.meals.map((meal, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-md p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500 capitalize">{meal.mealType}</p>
                            <p className="font-medium text-gray-900">{meal.mealName}</p>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{meal.calories} cal</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          P {meal.protein}g · C {meal.carbs}g · F {meal.fats}g
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">Set your preferences and generate a plan to get started.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

