import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { TrendingUp, Calendar, Brain } from 'lucide-react';
import axios from 'axios';

const MoodPatternsPage = () => {
  const { currentUser } = useAuth();
  const [moodData, setMoodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');

  useEffect(() => {
    if (currentUser) {
      fetchMoodPatterns();
    }
  }, [currentUser, timeRange]);

  const fetchMoodPatterns = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      
      if (timeRange === '7days') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (timeRange === '30days') {
        startDate.setDate(endDate.getDate() - 30);
      } else {
        startDate.setDate(endDate.getDate() - 90);
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/meals/mood-patterns/${currentUser.uid}`,
        {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        }
      );

      setMoodData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching mood patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood) => {
    const emojiMap = {
      'very_bad': '😞',
      'bad': '😕',
      'neutral': '😐',
      'good': '😊',
      'excellent': '😄'
    };
    return emojiMap[mood] || '❓';
  };

  const getMoodLabel = (mood) => {
    const labelMap = {
      'very_bad': 'Very Bad',
      'bad': 'Bad',
      'neutral': 'Neutral',
      'good': 'Good',
      'excellent': 'Excellent'
    };
    return labelMap[mood] || 'Unknown';
  };

  const calculateMoodStats = () => {
    if (moodData.length === 0) return null;

    const moodCounts = {
      before: { very_bad: 0, bad: 0, neutral: 0, good: 0, excellent: 0 },
      after: { very_bad: 0, bad: 0, neutral: 0, good: 0, excellent: 0 }
    };

    let improvementCount = 0;
    let worseCount = 0;

    const moodValues = {
      'very_bad': 1,
      'bad': 2,
      'neutral': 3,
      'good': 4,
      'excellent': 5
    };

    moodData.forEach(meal => {
      if (meal.moodBefore) {
        moodCounts.before[meal.moodBefore]++;
      }
      if (meal.moodAfter) {
        moodCounts.after[meal.moodAfter]++;
      }

      if (meal.moodBefore && meal.moodAfter) {
        const beforeValue = moodValues[meal.moodBefore];
        const afterValue = moodValues[meal.moodAfter];
        
        if (afterValue > beforeValue) improvementCount++;
        else if (afterValue < beforeValue) worseCount++;
      }
    });

    const mostCommonBefore = Object.entries(moodCounts.before)
      .sort((a, b) => b[1] - a[1])[0];
    
    const mostCommonAfter = Object.entries(moodCounts.after)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      totalMeals: moodData.length,
      improvementCount,
      worseCount,
      mostCommonBefore: mostCommonBefore[1] > 0 ? mostCommonBefore[0] : null,
      mostCommonAfter: mostCommonAfter[1] > 0 ? mostCommonAfter[0] : null,
      improvementRate: moodData.length > 0 ? Math.round((improvementCount / moodData.length) * 100) : 0
    };
  };

  const stats = calculateMoodStats();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500">Loading mood patterns...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Mood Patterns</h1>
          </div>
          <p className="text-gray-600">Track your emotional eating patterns and insights</p>
        </div>

        {/* Time Range Filter */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === '7days'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === '30days'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange('90days')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === '90days'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Last 90 Days
          </button>
        </div>

        {moodData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Mood Data Yet</h3>
            <p className="text-gray-600 mb-4">
              Start tracking your mood with meals to see patterns and insights here.
            </p>
            <a
              href="/dashboard/meal-tracking"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Log Your First Meal
            </a>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-green-900">Mood Improvement</h3>
                    <TrendingUp className="h-5 w-5 text-green-700" />
                  </div>
                  <p className="text-3xl font-bold text-green-900">{stats.improvementRate}%</p>
                  <p className="text-sm text-green-700 mt-1">
                    {stats.improvementCount} meals improved your mood
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-purple-900">Most Common Before</h3>
                    <Calendar className="h-5 w-5 text-purple-700" />
                  </div>
                  <p className="text-3xl font-bold text-purple-900">
                    {stats.mostCommonBefore ? getMoodEmoji(stats.mostCommonBefore) : '❓'}
                  </p>
                  <p className="text-sm text-purple-700 mt-1">
                    {stats.mostCommonBefore ? getMoodLabel(stats.mostCommonBefore) : 'No data'}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-blue-900">Most Common After</h3>
                    <Brain className="h-5 w-5 text-blue-700" />
                  </div>
                  <p className="text-3xl font-bold text-blue-900">
                    {stats.mostCommonAfter ? getMoodEmoji(stats.mostCommonAfter) : '❓'}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    {stats.mostCommonAfter ? getMoodLabel(stats.mostCommonAfter) : 'No data'}
                  </p>
                </div>
              </div>
            )}

            {/* Insights */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border-2 border-yellow-200 mb-8">
              <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                <span>💡</span> Key Insights
              </h3>
              <ul className="space-y-2 text-sm text-yellow-800">
                {stats.improvementRate >= 60 && (
                  <li>✨ Great news! Most of your meals are improving your mood.</li>
                )}
                {stats.improvementRate < 40 && (
                  <li>⚠️ Many meals aren't improving your mood. Consider reviewing your eating habits.</li>
                )}
                {stats.mostCommonBefore === 'very_bad' || stats.mostCommonBefore === 'bad' && (
                  <li>🤔 You often feel down before eating. Try stress-relief techniques before meals.</li>
                )}
                {stats.totalMeals < 5 && (
                  <li>📊 Track more meals to get better insights into your emotional eating patterns.</li>
                )}
              </ul>
            </div>

            {/* Meal History */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Mood History</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {moodData.map((meal, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{meal.mealName}</h3>
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded capitalize">
                            {meal.mealType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {formatDate(meal.date)}
                        </p>
                        
                        <div className="flex gap-6 text-sm">
                          {meal.moodBefore && (
                            <div>
                              <span className="text-gray-600">Before: </span>
                              <span className="text-lg">{getMoodEmoji(meal.moodBefore)}</span>
                              <span className="text-gray-700 ml-1">{getMoodLabel(meal.moodBefore)}</span>
                            </div>
                          )}
                          {meal.moodAfter && (
                            <div>
                              <span className="text-gray-600">After: </span>
                              <span className="text-lg">{getMoodEmoji(meal.moodAfter)}</span>
                              <span className="text-gray-700 ml-1">{getMoodLabel(meal.moodAfter)}</span>
                            </div>
                          )}
                        </div>

                        {meal.moodNotes && (
                          <p className="text-sm text-gray-600 italic mt-2">
                            "{meal.moodNotes}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MoodPatternsPage;
