import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { ChefHat } from 'lucide-react';

export default function RecipeLabPage() {
  const { user, loading, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const cards = [
    { title: 'Quick lunches', desc: '10–15 minute ideas for busy days.' },
    { title: 'High-protein', desc: 'Stay full with 25g+ protein per meal.' },
    { title: 'Low-carb snacks', desc: 'Smart bites under 10g net carbs.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Recipe Lab</p>
            <h1 className="text-3xl font-bold text-gray-900">
              {userProfile?.name ? `${userProfile.name}'s recipe lab` : 'Your recipe lab'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">Discover and organize meal ideas.</p>
          </div>
          <ChefHat className="h-8 w-8 text-green-600" />
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <p className="text-sm text-gray-700">
            This space will surface recipes based on your pantry and preferences. Add sources, tags, and save favorites.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {cards.map((card) => (
              <div key={card.title} className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm font-semibold text-gray-900">{card.title}</p>
                <p className="text-xs text-gray-600 mt-1">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

