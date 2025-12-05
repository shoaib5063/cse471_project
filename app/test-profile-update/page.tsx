'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile, getUserProfile } from '../../lib/firebase/userProfile';

export default function TestProfileUpdatePage() {
  const { user, userProfile } = useAuth();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testUpdate = async () => {
    if (!user) {
      setResult({ success: false, error: 'Not logged in' });
      return;
    }

    setLoading(true);
    try {
      // Test data
      const testData = {
        age: 25,
        gender: 'male' as const,
        weight: 70,
        height: 175,
        activityLevel: 'moderate' as const,
        dietaryPreferences: ['Vegetarian'],
        healthGoals: ['Weight Loss'],
      };

      console.log('Testing update with:', testData);
      
      // Try to update
      await updateUserProfile(user.uid, testData);
      
      // Fetch updated profile
      const updated = await getUserProfile(user.uid);
      
      setResult({
        success: true,
        message: 'Profile updated successfully!',
        before: userProfile,
        after: updated,
      });
    } catch (error: any) {
      console.error('Update failed:', error);
      setResult({
        success: false,
        error: error.message,
        code: error.code,
        details: error,
      });
    } finally {
      setLoading(false);
    }
  };

  const checkProfile = async () => {
    if (!user) {
      setResult({ success: false, error: 'Not logged in' });
      return;
    }

    setLoading(true);
    try {
      const profile = await getUserProfile(user.uid);
      setResult({
        success: true,
        message: 'Profile fetched successfully',
        profile,
      });
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test Profile Update
        </h1>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current User</h2>
          {user ? (
            <div className="space-y-2">
              <p className="text-sm"><strong>Email:</strong> {user.email}</p>
              <p className="text-sm"><strong>UID:</strong> {user.uid}</p>
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="text-sm font-semibold mb-2">Current Profile:</p>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(userProfile, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-red-600">Not logged in. Go to /auth to login.</p>
          )}
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-3">
            <button
              onClick={checkProfile}
              disabled={loading || !user}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : '1. Check Current Profile'}
            </button>

            <button
              onClick={testUpdate}
              disabled={loading || !user}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : '2. Test Profile Update'}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            <div className={`p-4 rounded ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`font-semibold mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? '✅ Success' : '❌ Error'}
              </p>
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Make sure you're logged in (check "Current User" section above)</li>
            <li>Click "Check Current Profile" to see your current data</li>
            <li>Click "Test Profile Update" to update with test data</li>
            <li>Check the result to see if it worked</li>
          </ol>
        </div>

        {/* Common Errors */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">Common Errors:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
            <li><strong>Missing or insufficient permissions:</strong> Firestore security rules need to be updated</li>
            <li><strong>Not logged in:</strong> Go to /auth to login first</li>
            <li><strong>Document doesn't exist:</strong> Profile needs to be created first</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
