import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Heart, TrendingUp, Scale } from 'lucide-react';

export default function HealthMetricsPage() {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    weight: userProfile?.weight || 0,
    bmi: 0,
    calorieGoal: 2000,
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

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (userProfile?.weight && userProfile?.height) {
      const heightInMeters = userProfile.height / 100;
      const bmi = (userProfile.weight / (heightInMeters * heightInMeters)).toFixed(1);
      setMetrics(prev => ({ ...prev, weight: userProfile.weight, bmi }));
    }
  }, [userProfile]);

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
