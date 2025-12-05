'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Header } from '../../components/layout/Header';
import { calculateBMI, calculateDailyCalories } from '../../lib/firebase/userProfile';
import { BMIData } from '../../lib/types/user';
import { Activity, TrendingUp, Target, Flame } from 'lucide-react';

// Manual BMI Calculator Component
const ManualBMICalculator: React.FC = () => {
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [result, setResult] = useState<BMIData | null>(null);

  const handleCalculate = () => {
    if (weight > 0 && height > 0) {
      const bmiResult = calculateBMI(weight, height);
      setResult(bmiResult);
    }
  };

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (bmi < 25) return 'bg-green-100 text-green-800 border-green-300';
    if (bmi < 30) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-white mb-2">
            Weight (kg)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-30 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            placeholder="Enter weight"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-white mb-2">
            Height (cm)
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-30 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            placeholder="Enter height"
          />
        </div>
      </div>

      <button
        onClick={handleCalculate}
        className="w-full bg-white text-purple-700 font-bold py-3 px-6 rounded-xl hover:bg-purple-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        Calculate BMI
      </button>

      {result && (
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-6 shadow-inner">
          <div className="text-center mb-4">
            <div className="text-5xl font-extrabold text-purple-900 mb-2">
              {result.bmi}
            </div>
            <div className="text-sm text-purple-600 mb-3">kg/m²</div>
            <div className={`inline-block px-5 py-2 rounded-full font-bold border-2 ${getBMIColor(result.bmi)}`}>
              {result.category}
            </div>
          </div>
          <div className="border-t border-purple-200 pt-4 mt-4">
            <p className="text-sm text-purple-900 text-center">
              {result.bmi < 18.5 && 'Consider consulting a healthcare provider about healthy weight gain.'}
              {result.bmi >= 18.5 && result.bmi < 25 && 'Great! You\'re in the healthy weight range.'}
              {result.bmi >= 25 && result.bmi < 30 && 'Consider a balanced diet and regular exercise.'}
              {result.bmi >= 30 && 'Consult with a healthcare provider for personalized guidance.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

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
              <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-8 overflow-hidden transform hover:scale-105 transition-transform duration-300">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-16 -mb-16"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl mr-4">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Body Mass Index</h2>
                      <p className="text-sm text-blue-100">BMI Calculation</p>
                    </div>
                  </div>

                  {bmiData && (
                    <>
                      <div className="mb-6">
                        <div className="flex items-baseline mb-3">
                          <span className="text-6xl font-extrabold text-white drop-shadow-lg">{bmiData.bmi}</span>
                          <span className="ml-3 text-xl text-blue-100">kg/m²</span>
                        </div>
                        <div className={`inline-block px-5 py-2 rounded-full font-bold text-sm shadow-lg ${getBMIColor(bmiData.bmi)} border-2 border-white`}>
                          {bmiData.category}
                        </div>
                      </div>

                      <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-5 mb-4 border border-white border-opacity-30">
                        <h3 className="font-bold text-white mb-3 text-lg">Your Measurements</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-blue-100 font-medium">Weight:</span>
                            <span className="font-bold text-white text-lg">{userProfile.weight} kg</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-100 font-medium">Height:</span>
                            <span className="font-bold text-white text-lg">{userProfile.height} cm</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-4 shadow-inner">
                        <p className="text-sm text-blue-900 font-medium leading-relaxed">{getBMIRecommendation(bmiData.category)}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Daily Calorie Goal Card */}
              <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-2xl shadow-2xl p-8 overflow-hidden transform hover:scale-105 transition-transform duration-300">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-16 -mb-16"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl mr-4">
                      <Flame className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Daily Calorie Goal</h2>
                      <p className="text-sm text-orange-100">Recommended Intake</p>
                    </div>
                  </div>

                  {bmiData && bmiData.dailyCalories > 0 ? (
                    <>
                      <div className="mb-6">
                        <div className="flex items-baseline mb-3">
                          <span className="text-6xl font-extrabold text-white drop-shadow-lg">{bmiData.dailyCalories}</span>
                          <span className="ml-3 text-xl text-orange-100">kcal/day</span>
                        </div>
                        <p className="text-sm text-orange-100 font-medium">Based on your activity level</p>
                      </div>

                      <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-5 mb-4 border border-white border-opacity-30">
                        <h3 className="font-bold text-white mb-3 text-lg">Calculation Factors</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-orange-100 font-medium">Age:</span>
                            <span className="font-bold text-white text-lg">{userProfile.age} years</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-orange-100 font-medium">Gender:</span>
                            <span className="font-bold text-white text-lg capitalize">{userProfile.gender}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-orange-100 font-medium">Activity Level:</span>
                            <span className="font-bold text-white text-lg capitalize">{userProfile.activityLevel?.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-4 shadow-inner">
                        <p className="text-sm text-orange-900 font-medium leading-relaxed">
                          This is your maintenance calorie level. Adjust based on your health goals:
                          <br />
                          <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold mr-2">
                            Weight loss: -500 kcal/day
                          </span>
                          <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                            Weight gain: +500 kcal/day
                          </span>
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

            {/* Manual BMI Calculator */}
            <div className="mt-6 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 rounded-2xl shadow-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl mr-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Quick BMI Calculator</h3>
                  <p className="text-sm text-purple-100">Calculate BMI without saving to profile</p>
                </div>
              </div>

              <ManualBMICalculator />
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
