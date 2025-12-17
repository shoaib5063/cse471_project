import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getActiveChallenges, getUserChallenges, joinChallenge } from '../lib/services/challengeService';
import { motion } from 'framer-motion';
import { Trophy, Target, Calendar, CheckCircle, Flame, Salad, Droplets, Dumbbell } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const ChallengesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'my'
  const [joiningId, setJoiningId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      setError('Please sign in to view challenges.');
      return;
    }
    fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [active, ucList] = await Promise.all([
        getActiveChallenges(),
        getUserChallenges(user.uid)
      ]);
      setActiveChallenges(active);
      setUserChallenges(ucList);
    } catch (err) {
      console.error(err);
      setError('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (challengeId) => {
    setJoiningId(challengeId);
    try {
      await joinChallenge(challengeId, user.uid);
      // Refresh data
      await fetchData();
      setActiveTab('my');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to join challenge');
    } finally {
      setJoiningId(null);
    }
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-6 h-6 text-orange-500" />;
      case 'Salad': return <Salad className="w-6 h-6 text-green-500" />;
      case 'Droplets': return <Droplets className="w-6 h-6 text-blue-500" />;
      case 'Dumbbell': return <Dumbbell className="w-6 h-6 text-purple-500" />;
      default: return <Trophy className="w-6 h-6 text-yellow-500" />;
    }
  };

  // Filter out active challenges that user has already joined
  const availableChallenges = activeChallenges.filter(
    ac => !userChallenges.some(uc => uc.challengeId?._id === ac._id)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Weekly Challenges</h1>
            <p className="text-gray-600 mt-2">Join challenges to stay motivated and track your progress!</p>
          </div>
          
          <div className="flex bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'browse' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Browse Available
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'my' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              My Challenges
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'browse' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableChallenges.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No new challenges available right now.</p>
                    <p className="text-sm text-gray-400">Check back later!</p>
                  </div>
                ) : (
                  availableChallenges.map((challenge) => (
                    <motion.div
                      key={challenge._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            {getIcon(challenge.icon)}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            challenge.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            challenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{challenge.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 h-12 overflow-hidden">{challenge.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            <span>Target: {challenge.targetValue} {challenge.unit}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{challenge.durationDays} Days</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleJoin(challenge._id)}
                          disabled={joiningId === challenge._id}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          {joiningId === challenge._id ? (
                            <span className="animate-pulse">Joining...</span>
                          ) : (
                            <>Accept Challenge</>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'my' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userChallenges.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm">
                    <p className="text-gray-500">You haven't joined any challenges yet.</p>
                    <button 
                      onClick={() => setActiveTab('browse')}
                      className="text-emerald-600 font-medium hover:underline mt-2"
                    >
                      Browse available challenges
                    </button>
                  </div>
                ) : (
                  userChallenges.map((uc) => {
                    const challenge = uc.challengeId;
                    if (!challenge) return null; // Handle deleted challenges
                    
                    const progressPercent = Math.min(100, (uc.progress / challenge.targetValue) * 100);
                    
                    return (
                      <motion.div
                        key={uc._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 rounded-lg">
                              {getIcon(challenge.icon)}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{challenge.title}</h3>
                              <p className="text-xs text-gray-500">Ends {new Date(challenge.endDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {uc.status === 'completed' && (
                            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold">
                              <CheckCircle className="w-4 h-4" />
                              <span>Completed</span>
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium text-gray-900">
                              {uc.progress} / {challenge.targetValue} {challenge.unit}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                uc.status === 'completed' ? 'bg-green-500' : 'bg-emerald-600'
                              }`}
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                           <span className="text-gray-500">
                             Reward: <span className="text-yellow-600 font-bold">+{challenge.xpReward} XP</span>
                           </span>
                           {uc.status === 'active' && (
                             <span className="text-emerald-600 font-medium">Keep going!</span>
                           )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ChallengesPage;
