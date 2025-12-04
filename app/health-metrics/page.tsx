'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Header } from '../../components/layout/Header';
import { calculateBMI, calculateDailyCalories } from '../../lib/firebase/userProfile';
import { BMIData } from '../../lib/types/user';
import { Activity, TrendingUp, Target, Flame } from 'lucide-react';

export default function HealthMetricsPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [bmiData, setBmiData] = useState<BMIData | null>(null);

  useEffect(() => {
    if (userProfile?.weight && userProfile?.height) {
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
  }, [userProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth');
    return null;
  }

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return 'text-blue-600 bg-blue-50';
    if (bmi < 25) return 'text-green-600 bg-green-50';
    if (bmi < 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getBMIRecommendation = (category: string) => {
    switch (category) {
      case 'Underweight':
        return 'Consider consulting a healthcare provider about healthy weight gain strategies.';
      case 'Normal weight':
        return 'Great job! Maintain your healthy lifestyle with balanced nutrition and regular exercise.';
      case 'Overweight':
        return 'Consider a balanced diet and regular physical activity to reach a healthier weight.';
      case 'Obese':
        return 'Consult with a healthcare provider for personalized guidance on healthy weight management.';
      default:
        return '';
    }
  };

  const getActivityLevelDescription = (level: string) => {
    const descriptions: { [key: string]: string } = {
      sedentary: 'Little or no exercise',
      light: 'Exercise 1-3 days/week',
      moderate: 'Exercise 3-5 days/week',
      active: 'Exercise 6-7 days/week',
      very_active: 'Intense exercise daily'
    };
    return descriptions[level] || level;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Health Metrics</h1>
          <p className="text-gray-600">Track your BMI and daily calorie goals based on your profile</p>
        </div>

        {!userProfile?.weight || !userProfile?.height ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Complete Your Profile</h3>
            <p className="text-yellow-700 mb-4">
              Please update your profile with your weight, height, age, and activity level to see your health metrics.
            </p>
            <button
              onClick={() => router.push('/profile')}
              className="bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700 transition-colors"
            >
              Update Profile
            </button>
          </div>
        ) : (
          <>
            {/* BMI Card */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Body Mass Index</h2>
                    <p className="text-sm text-gray-500">BMI Calculation</p>
                  </div>
                </div>

                {bmiData && (
                  <>
                    <div className="mb-6">
                      <div className="flex items-baseline mb-2">
                        <span className="text-5xl font-bold text-gray-900">{bmiData.bmi}</span>
                        <span className="ml-2 text-gray-500">kg/m²</span>
                      </div>
                      <div className={`inline-block px-4 py-2 rounded-full font-semibold ${getBMIColor(bmiData.bmi)}`}>
                        {bmiData.category}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Your Measurements</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Weight:</span>
                          <span className="font-medium">{userProfile.weight} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Height:</span>
                          <span className="font-medium">{userProfile.height} cm</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">{getBMIRecommendation(bmiData.category)}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Daily Calorie Goal Card */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-orange-100 rounded-lg mr-4">
                    <Flame className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Daily Calorie Goal</h2>
                    <p className="text-sm text-gray-500">Recommended Intake</p>
                  </div>
                </div>

                {bmiData && bmiData.dailyCalories > 0 ? (
                  <>
                    <div className="mb-6">
                      <div className="flex items-baseline mb-2">
                        <span className="text-5xl font-bold text-gray-900">{bmiData.dailyCalories}</span>
                        <span className="ml-2 text-gray-500">kcal/day</span>
                      </div>
                      <p className="text-sm text-gray-600">Based on your activity level</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Calculation Factors</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Age:</span>
                          <span className="font-medium">{userProfile.age} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gender:</span>
                          <span className="font-medium capitalize">{userProfile.gender}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Activity Level:</span>
                          <span className="font-medium capitalize">{userProfile.activityLevel?.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-sm text-orange-800">
                        This is your maintenance calorie level. Adjust based on your health goals:
                        <br />• Weight loss: -500 kcal/day
                        <br />• Weight gain: +500 kcal/day
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      Complete your profile with age, gender, and activity level to see your daily calorie goal.
                    </p>
                    <button
                      onClick={() => router.push('/profile')}
                      className="mt-3 text-sm text-yellow-700 font-semibold hover:text-yellow-900"
                    >
                      Update Profile →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-3">
                  <Activity className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Activity Level</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1 capitalize">
                  {userProfile.activityLevel?.replace('_', ' ')}
                </p>
                <p className="text-sm text-gray-600">
                  {getActivityLevelDescription(userProfile.activityLevel || '')}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-3">
                  <Target className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">Health Goals</h3>
                </div>
                {userProfile.healthGoals && userProfile.healthGoals.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userProfile.healthGoals.map((goal) => (
                      <span
                        key={goal}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No goals set yet</p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  <h3 className="font-semibold text-gray-900">Dietary Preferences</h3>
                </div>
                {userProfile.dietaryPreferences && userProfile.dietaryPreferences.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userProfile.dietaryPreferences.map((pref) => (
                      <span
                        key={pref}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                      >
                        {pref}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No preferences set</p>
                )}
              </div>
            </div>

            {/* BMI Reference Chart */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">BMI Reference Chart</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-700">Underweight</div>
                  <div className="flex-1 h-8 bg-blue-100 rounded flex items-center px-3">
                    <span className="text-sm text-blue-800">&lt; 18.5</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-700">Normal weight</div>
                  <div className="flex-1 h-8 bg-green-100 rounded flex items-center px-3">
                    <span className="text-sm text-green-800">18.5 - 24.9</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-700">Overweight</div>
                  <div className="flex-1 h-8 bg-yellow-100 rounded flex items-center px-3">
                    <span className="text-sm text-yellow-800">25 - 29.9</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-700">Obese</div>
                  <div className="flex-1 h-8 bg-red-100 rounded flex items-center px-3">
                    <span className="text-sm text-red-800">≥ 30</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
