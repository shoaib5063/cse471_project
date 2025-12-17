import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Activity,
  Heart,
  TrendingUp,
  Scale,
  ClipboardList,
  ListChecks,
  ChefHat,
  Lightbulb,
  Calculator,
} from 'lucide-react';
import { calculateCalorieGoal } from '../lib/calculations';

export default function HealthMetricsPage() {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    weight: userProfile?.weight || 0,
    bmi: 0,
    calorieGoal: calculateCalorieGoal(userProfile),
    waterIntake: 0,
  });

  const [weightHistory] = useState([
    { date: '2024-01', weight: 75 },
    { date: '2024-02', weight: 74 },
    { date: '2024-03', weight: 73 },
    { date: '2024-04', weight: 72 },
    { date: '2024-05', weight: 71 },
    { date: '2024-06', weight: 70 },
  ]);
  const [activeSection, setActiveSection] = useState('health-metrics');
  const [bmiCalculator, setBmiCalculator] = useState({
    weight: '',
    height: '',
    calculatedBMI: null,
  });

  const sections = [
    {
      id: 'health-metrics',
      label: 'Health Metrics',
      description: 'Weight, BMI, goals, and activity',
      icon: Activity,
    },
    {
      id: 'meal-tracking',
      label: 'Meal Tracking',
      description: 'Log meals and monitor macros',
      icon: ClipboardList,
    },
    {
      id: 'meal-plans',
      label: 'Meal Plans',
      description: 'Daily or weekly nutrition plans',
      icon: ListChecks,
    },
    {
      id: 'recipe-lab',
      label: 'Recipe Lab',
      description: 'Ideas tailored to your pantry',
      icon: ChefHat,
    },
    {
      id: 'health-tips',
      label: 'Health Tips',
      description: 'Quick reminders and guidance',
      icon: Lightbulb,
    },
  ];

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (userProfile) {
      const heightInMeters = userProfile.height / 100;
      const bmi = userProfile.weight && userProfile.height
        ? (userProfile.weight / (heightInMeters * heightInMeters)).toFixed(1)
        : 0;
      const calorieGoal = calculateCalorieGoal(userProfile);
      setMetrics(prev => ({
        ...prev,
        weight: userProfile.weight || 0,
        bmi,
        calorieGoal
      }));
    }
  }, [userProfile]);

  // Fetch today's hydration data
  useEffect(() => {
    const fetchHydration = async () => {
      if (!user) return;
      try {
        // Get today's date in local time
        const today = new Date();
        const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/hydration/${user.uid}?date=${dateString}`
        );
        // API returns totalAmount in ml, convert to liters for display
        const totalMl = response.data.totalAmount || 0;
        const totalLiters = (totalMl / 1000).toFixed(1);
        setMetrics(prev => ({ ...prev, waterIntake: totalLiters }));
      } catch (error) {
        console.error('Error fetching hydration:', error);
      }
    };
    fetchHydration();
  }, [user]);

  const calculateBMI = (weight, height) => {
    if (!weight || !height || weight <= 0 || height <= 0) {
      return null;
    }
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return parseFloat(bmi.toFixed(1));
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return '';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const getBMIColor = (bmi) => {
    if (!bmi) return 'text-gray-500';
    if (bmi < 18.5) return 'text-blue-600';
    if (bmi < 25) return 'text-green-600';
    if (bmi < 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleBMICalculate = () => {
    const weight = parseFloat(bmiCalculator.weight);
    const height = parseFloat(bmiCalculator.height);
    const calculatedBMI = calculateBMI(weight, height);
    setBmiCalculator(prev => ({ ...prev, calculatedBMI }));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Health Metrics</h1>
          <p className="mt-2 text-gray-600">Track your health and fitness progress</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Weight</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.weight}</p>
                <p className="text-sm text-gray-500">kg</p>
              </div>
              <Scale className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">BMI</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.bmi}</p>
                <p className="text-sm text-gray-500">
                  {metrics.bmi < 18.5 ? 'Underweight' : metrics.bmi < 25 ? 'Normal' : metrics.bmi < 30 ? 'Overweight' : 'Obese'}
                </p>
              </div>
              <Activity className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Calorie Goal</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.calorieGoal}</p>
                <p className="text-sm text-gray-500">kcal/day</p>
              </div>
              <TrendingUp className="h-12 w-12 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Water Intake</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.waterIntake}</p>
                <p className="text-sm text-gray-500">liters/day</p>
              </div>
              <Heart className="h-12 w-12 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Weight Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">BMI Calculator</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={bmiCalculator.weight}
                  onChange={(e) => {
                    const weight = e.target.value;
                    setBmiCalculator(prev => ({ ...prev, weight }));
                    if (weight && bmiCalculator.height) {
                      const calculatedBMI = calculateBMI(parseFloat(weight), parseFloat(bmiCalculator.height));
                      setBmiCalculator(prev => ({ ...prev, calculatedBMI }));
                    } else {
                      setBmiCalculator(prev => ({ ...prev, calculatedBMI: null }));
                    }
                  }}
                  placeholder="Enter weight in kg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={bmiCalculator.height}
                  onChange={(e) => {
                    const height = e.target.value;
                    setBmiCalculator(prev => ({ ...prev, height }));
                    if (height && bmiCalculator.weight) {
                      const calculatedBMI = calculateBMI(parseFloat(bmiCalculator.weight), parseFloat(height));
                      setBmiCalculator(prev => ({ ...prev, calculatedBMI }));
                    } else {
                      setBmiCalculator(prev => ({ ...prev, calculatedBMI: null }));
                    }
                  }}
                  placeholder="Enter height in cm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleBMICalculate}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Calculate BMI
              </button>
            </div>
            <div className="flex items-center justify-center">
              {bmiCalculator.calculatedBMI ? (
                <div className="text-center">
                  <div className={`text-6xl font-bold mb-2 ${getBMIColor(bmiCalculator.calculatedBMI)}`}>
                    {bmiCalculator.calculatedBMI}
                  </div>
                  <div className={`text-lg font-semibold ${getBMIColor(bmiCalculator.calculatedBMI)}`}>
                    {getBMICategory(bmiCalculator.calculatedBMI)}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">BMI Categories:</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Underweight: &lt; 18.5</p>
                      <p>Normal: 18.5 - 24.9</p>
                      <p>Overweight: 25 - 29.9</p>
                      <p>Obese: ≥ 30</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <Scale className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Enter weight and height to calculate BMI</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Health Goals</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Weight Loss Goal</span>
                  <span className="text-sm font-semibold text-gray-900">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Daily Calorie Target</span>
                  <span className="text-sm font-semibold text-gray-900">60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Exercise Minutes</span>
                  <span className="text-sm font-semibold text-gray-900">40%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium text-gray-900">Morning Run</p>
                  <p className="text-sm text-gray-600">30 minutes</p>
                </div>
                <span className="text-sm text-green-600 font-semibold">250 cal</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium text-gray-900">Yoga Session</p>
                  <p className="text-sm text-gray-600">45 minutes</p>
                </div>
                <span className="text-sm text-green-600 font-semibold">180 cal</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900">Evening Walk</p>
                  <p className="text-sm text-gray-600">20 minutes</p>
                </div>
                <span className="text-sm text-green-600 font-semibold">100 cal</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
