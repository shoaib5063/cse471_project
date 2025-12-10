import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Lightbulb } from 'lucide-react';

export default function HealthTipsPage() {
  const { user, loading, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const tips = [
    'Drink 2-3L of water daily.',
    'Aim for 25-30g protein per meal.',
    'Prioritize fiber: veggies + whole grains.',
    'Plan snacks to avoid impulse choices.',
    'Sleep 7-9 hours for recovery.',
    'Walk 5-10 minutes after meals.',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Health Tips</p>
            <h1 className="text-3xl font-bold text-gray-900">
              {userProfile?.name ? `${userProfile.name}'s tips` : 'Your health tips'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">Quick reminders to stay on track.</p>
          </div>
          <Lightbulb className="h-8 w-8 text-yellow-500" />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tips.map((tip) => (
              <div key={tip} className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-900">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

