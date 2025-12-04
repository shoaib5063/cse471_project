'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Header } from '../../components/layout/Header';

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Welcome to Your Dashboard
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <p className="text-gray-600">Email: {user.email}</p>
          {userProfile?.age && (
            <p className="text-gray-600">Age: {userProfile.age}</p>
          )}
          {userProfile?.weight && userProfile?.height && (
            <p className="text-gray-600">
              Weight: {userProfile.weight}kg | Height: {userProfile.height}cm
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/health-metrics')}
              className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center justify-between"
            >
              <span className="font-medium">View Health Metrics</span>
              <span className="text-sm text-purple-600">BMI & Calories</span>
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              Update Your Profile
            </button>
            <button
              onClick={() => router.push('/meals')}
              className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Log a Meal
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
