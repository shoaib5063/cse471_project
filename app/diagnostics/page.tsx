'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function DiagnosticsPage() {
  const { user, userProfile, loading } = useAuth();
  const [mongoTest, setMongoTest] = useState<any>(null);
  const [firebaseTest, setFirebaseTest] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setTesting(true);

    // Test MongoDB
    try {
      const mongoRes = await fetch('/api/test-db');
      const mongoData = await mongoRes.json();
      setMongoTest(mongoData);
    } catch (error: any) {
      setMongoTest({ success: false, error: error.message });
    }

    // Test Firebase Config
    try {
      const firebaseRes = await fetch('/api/check-firebase');
      const firebaseData = await firebaseRes.json();
      setFirebaseTest(firebaseData);
    } catch (error: any) {
      setFirebaseTest({ success: false, error: error.message });
    }

    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          System Diagnostics
        </h1>

        {/* Firebase Auth Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Firebase Authentication</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">Auth Loading:</span>
              <span className={`px-3 py-1 rounded-full text-sm ${loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                {loading ? 'Loading...' : 'Ready'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">User Logged In:</span>
              <span className={`px-3 py-1 rounded-full text-sm ${user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {user ? 'Yes' : 'No'}
              </span>
            </div>
            {user && (
              <div className="p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>UID:</strong> {user.uid}
                </p>
              </div>
            )}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">User Profile:</span>
              <span className={`px-3 py-1 rounded-full text-sm ${userProfile ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {userProfile ? 'Loaded' : 'Not Loaded'}
              </span>
            </div>
          </div>
        </div>

        {/* Firebase Config Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Firebase Configuration</h2>
          {testing ? (
            <p className="text-gray-600">Testing...</p>
          ) : firebaseTest ? (
            <div className={`p-4 rounded ${firebaseTest.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`font-semibold mb-2 ${firebaseTest.success ? 'text-green-800' : 'text-red-800'}`}>
                {firebaseTest.success ? '✅ Firebase Config OK' : '❌ Firebase Config Issue'}
              </p>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(firebaseTest, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-gray-600">Loading...</p>
          )}
        </div>

        {/* MongoDB Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">MongoDB Connection</h2>
          {testing ? (
            <p className="text-gray-600">Testing...</p>
          ) : mongoTest ? (
            <div className={`p-4 rounded ${mongoTest.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`font-semibold mb-2 ${mongoTest.success ? 'text-green-800' : 'text-red-800'}`}>
                {mongoTest.success ? '✅ MongoDB Connected' : '❌ MongoDB Connection Failed'}
              </p>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(mongoTest, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-gray-600">Loading...</p>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={runTests}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Re-run Tests
            </button>
            {!user && (
              <button
                onClick={() => window.location.href = '/auth'}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Go to Login
              </button>
            )}
            {user && (
              <button
                onClick={() => window.location.href = '/profile'}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
              >
                Go to Profile
              </button>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Troubleshooting:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
            <li>If "Auth Loading" is stuck: Firebase may not be initializing</li>
            <li>If "User Logged In" is No: You need to log in first</li>
            <li>If MongoDB shows error: Check your connection string in .env.local</li>
            <li>If Firebase Config shows error: Check Firebase environment variables</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
