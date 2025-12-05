'use client';

import React, { useState } from 'react';

export default function TestMongoDBPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const createTestMeal = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user-123',
          mealName: 'Test Meal from UI',
          mealType: 'lunch',
          calories: 350,
          protein: 25,
          carbs: 30,
          fats: 15,
          notes: 'Testing MongoDB connection'
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getMeals = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/meals?userId=test-user-123');
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          MongoDB Connection Test
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-3">
            <button
              onClick={testConnection}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Testing...' : '1. Test MongoDB Connection'}
            </button>

            <button
              onClick={createTestMeal}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : '2. Create Test Meal'}
            </button>

            <button
              onClick={getMeals}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Loading...' : '3. Get All Meals'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Result:</h2>
            <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center mb-2">
                <span className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.success ? '✅ Success' : '❌ Error'}
                </span>
              </div>
              <pre className="text-sm overflow-auto max-h-96 text-gray-800">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Click "Test MongoDB Connection" to verify the connection</li>
            <li>Click "Create Test Meal" to add a meal to the database</li>
            <li>Click "Get All Meals" to retrieve all meals</li>
            <li>Check the result below each action</li>
          </ol>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">Your MongoDB Details:</h3>
          <div className="text-sm text-yellow-800 space-y-1">
            <p><strong>Username:</strong> cse471</p>
            <p><strong>Cluster:</strong> cluster0.0tswarq.mongodb.net</p>
            <p><strong>Database:</strong> mindfulmeals</p>
          </div>
        </div>
      </div>
    </div>
  );
}
