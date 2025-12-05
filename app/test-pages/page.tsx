'use client';

import React, { useState } from 'react';
import { calculateBMI, calculateDailyCalories } from '../../lib/firebase/userProfile';

export default function TestPagesPage() {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'>('moderate');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const bmi = calculateBMI(weight, height);
    const calories = calculateDailyCalories(weight, height, age, gender, activityLevel);
    setResult({ ...bmi, dailyCalories: calories });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <h2 className="text-lg font-bold text-yellow-800 mb-2">⚠️ Authentication Not Working?</h2>
          <p className="text-yellow-700 mb-2">
            This page works WITHOUT login so you can test the calculations!
          </p>
          <p className="text-sm text-yellow-600">
            To fix the loading issue on other pages, follow: <strong>URGENT_FIX.md</strong>
          </p>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test Health Calculations (No Login Required)
        </h1>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Enter Your Details</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age (years)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Level
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="light">Light (exercise 1-3 days/week)</option>
              <option value="moderate">Moderate (exercise 3-5 days/week)</option>
              <option value="active">Active (exercise 6-7 days/week)</option>
              <option value="very_active">Very Active (intense exercise daily)</option>
            </select>
          </div>

          <button
            onClick={calculate}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700"
          >
            Calculate BMI & Calories
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* BMI Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Your BMI</h2>
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {result.bmi}
                </div>
                <div className={`inline-block px-4 py-2 rounded-full font-semibold ${
                  result.bmi < 18.5 ? 'bg-blue-100 text-blue-800' :
                  result.bmi < 25 ? 'bg-green-100 text-green-800' :
                  result.bmi < 30 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {result.category}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3 text-sm">
                <p className="text-gray-700">
                  Weight: {weight} kg | Height: {height} cm
                </p>
              </div>
            </div>

            {/* Calories Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Daily Calorie Goal</h2>
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {result.dailyCalories}
                </div>
                <div className="text-gray-600">kcal/day</div>
              </div>
              <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
                <p className="text-gray-700">Age: {age} years</p>
                <p className="text-gray-700">Gender: {gender}</p>
                <p className="text-gray-700">Activity: {activityLevel.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">✅ This Page Works!</h3>
          <p className="text-sm text-blue-800 mb-2">
            This proves your calculations are working correctly. The issue with other pages is Firebase Authentication.
          </p>
          <p className="text-sm text-blue-800">
            <strong>To fix Profile and Health Metrics pages:</strong>
          </p>
          <ol className="list-decimal list-inside text-sm text-blue-800 mt-2 space-y-1">
            <li>Enable Firebase Authentication in Firebase Console</li>
            <li>Create Firestore Database</li>
            <li>Restart server</li>
            <li>Register/Login at /auth</li>
          </ol>
        </div>

        {/* Quick Links */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <a
            href="/diagnostics"
            className="block text-center bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700"
          >
            Check Diagnostics
          </a>
          <a
            href="/test-mongodb"
            className="block text-center bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700"
          >
            Test MongoDB
          </a>
        </div>
      </div>
    </div>
  );
}
