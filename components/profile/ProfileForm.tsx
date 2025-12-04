'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile, calculateBMI, calculateDailyCalories } from '../../lib/firebase/userProfile';
import { BMIData } from '../../lib/types/user';

export const ProfileForm: React.FC = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const [age, setAge] = useState(userProfile?.age || 0);
  const [gender, setGender] = useState(userProfile?.gender || 'male');
  const [weight, setWeight] = useState(userProfile?.weight || 0);
  const [height, setHeight] = useState(userProfile?.height || 0);
  const [activityLevel, setActivityLevel] = useState(userProfile?.activityLevel || 'moderate');
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(userProfile?.dietaryPreferences || []);
  const [healthGoals, setHealthGoals] = useState<string[]>(userProfile?.healthGoals || []);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bmiData, setBmiData] = useState<BMIData | null>(null);

  useEffect(() => {
    if (userProfile) {
      setAge(userProfile.age || 0);
      setGender(userProfile.gender || 'male');
      setWeight(userProfile.weight || 0);
      setHeight(userProfile.height || 0);
      setActivityLevel(userProfile.activityLevel || 'moderate');
      setDietaryPreferences(userProfile.dietaryPreferences || []);
      setHealthGoals(userProfile.healthGoals || []);
      
      if (userProfile.weight && userProfile.height) {
        const bmi = calculateBMI(userProfile.weight, userProfile.height);
        if (userProfile.age && userProfile.gender && userProfile.activityLevel) {
          const calories = calculateDailyCalories(
            userProfile.weight,
            userProfile.height,
            userProfile.age,
            userProfile.gender,
            userProfile.activityLevel
          );
          setBmiData({ ...bmi, dailyCalories: calories });
        } else {
          setBmiData(bmi);
        }
      }
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSuccess(false);

    try {
      await updateUserProfile(user.uid, {
        age,
        gender: gender as 'male' | 'female' | 'other',
        weight,
        height,
        activityLevel: activityLevel as any,
        dietaryPreferences,
        healthGoals,
      });
      
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Update Your Profile</h2>
      
      {bmiData && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Your Health Metrics</h3>
          <p className="text-gray-700">BMI: {bmiData.bmi} ({bmiData.category})</p>
          {bmiData.dailyCalories > 0 && (
            <p className="text-gray-700">Daily Calorie Goal: {bmiData.dailyCalories} kcal</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              value={age || ''}
              onChange={(e) => setAge(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              value={weight || ''}
              onChange={(e) => setWeight(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              value={height || ''}
              onChange={(e) => setHeight(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activity Level
          </label>
          <select
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="sedentary">Sedentary (little or no exercise)</option>
            <option value="light">Light (exercise 1-3 days/week)</option>
            <option value="moderate">Moderate (exercise 3-5 days/week)</option>
            <option value="active">Active (exercise 6-7 days/week)</option>
            <option value="very_active">Very Active (intense exercise daily)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dietary Preferences
          </label>
          <div className="flex flex-wrap gap-2">
            {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Low-Carb', 'Keto'].map(pref => (
              <button
                key={pref}
                type="button"
                onClick={() => toggleArrayItem(dietaryPreferences, pref, setDietaryPreferences)}
                className={`px-3 py-1 rounded-full text-sm ${
                  dietaryPreferences.includes(pref)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {pref}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Health Goals
          </label>
          <div className="flex flex-wrap gap-2">
            {['Weight Loss', 'Muscle Gain', 'Maintain Weight', 'Better Nutrition', 'More Energy'].map(goal => (
              <button
                key={goal}
                type="button"
                onClick={() => toggleArrayItem(healthGoals, goal, setHealthGoals)}
                className={`px-3 py-1 rounded-full text-sm ${
                  healthGoals.includes(goal)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        {success && (
          <div className="text-green-600 text-sm">Profile updated successfully!</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};
