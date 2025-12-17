import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import {
  Plus,
  Utensils,
  LayoutGrid,
  ClipboardList,
  ChefHat,
  Lightbulb,
  MessageSquare,
  Droplets,
  Target,
  Edit2,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Trash2,
  X,
  Trophy,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import MealReminderManager from '../components/reminders/MealReminderManager';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // Date State
  const getLocalDateString = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [hydrationLogs, setHydrationLogs] = useState([]);
  const [editingLog, setEditingLog] = useState(null);

  // Goals & Summary
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [hydrationGoal, setHydrationGoal] = useState(2000);
  const [isEditingHydrationGoal, setIsEditingHydrationGoal] = useState(false);

  const [summary, setSummary] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    hydration: 0
  });

  const sections = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'meal-tracking', label: 'Meal Tracking', icon: ClipboardList, to: '/dashboard/meal-tracking' },
    { id: 'meal-plans', label: 'Meal Plans', icon: Utensils, to: '/dashboard/meal-plans' },
    { id: 'challenges', label: 'Weekly Challenges', icon: Trophy, to: '/dashboard/challenges' },
    { id: 'recipe-lab', label: 'Recipe Lab', icon: ChefHat, to: '/dashboard/recipe-lab' },
    { id: 'health-tips', label: 'Health Tips', icon: Lightbulb, to: '/dashboard/health-tips' },
    { id: 'questions', label: 'Health Q&A', icon: MessageSquare, to: '/dashboard/questions' },
  ];

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && user.uid) {
      if (!userProfile) fetchUserProfile(); // Only fetch profile once
      fetchMeals();
      fetchSummary();
      fetchHydrationLogs();
    }
  }, [user, selectedDate]); // Refetch when date changes

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${user.uid}`);
      if (response.data.success) {
        setUserProfile(response.data.data);
        if (response.data.data.dailyCalorieGoal) {
          setCalorieGoal(response.data.data.dailyCalorieGoal);
        }
        if (response.data.data.dailyHydrationGoal) {
          setHydrationGoal(response.data.data.dailyHydrationGoal);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const updateCalorieGoal = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${user.uid}`, {
        dailyCalorieGoal: calorieGoal
      });
      setIsEditingGoal(false);
      fetchUserProfile();
    } catch (error) {
      console.error('Error updating calorie goal:', error);
    }
  };

  const updateHydrationGoal = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${user.uid}`, {
        dailyHydrationGoal: hydrationGoal
      });
      setIsEditingHydrationGoal(false);
      fetchUserProfile();
    } catch (error) {
      console.error('Error updating hydration goal:', error);
    }
  };

  const fetchMeals = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/meals/user/${user.uid}?date=${selectedDate}`
      );
      setMeals(response.data || []);
    } catch (error) {
      console.error('Error fetching meals:', error);
      setMeals([]);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/meals/summary/${user.uid}?date=${selectedDate}`
      );
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchHydrationLogs = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/hydration/${user.uid}?date=${selectedDate}`
      );
      setHydrationLogs(response.data.logs || []);
      // Optimistically update summary hydration if needed, or reply on fetchSummary
      setSummary(prev => ({ ...prev, hydration: response.data.totalAmount }));
    } catch (error) {
      console.error('Error fetching hydration logs:', error);
    }
  };

  const handleDateChange = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    // Use the same local date string helper logic but for arbitrary date
    const offset = date.getTimezoneOffset() * 60000;
    const newDateStr = new Date(date.getTime() - offset).toISOString().split('T')[0];
    setSelectedDate(newDateStr);
  };

  const logWater = async (amount) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/hydration`, {
        userId: user.uid,
        amount,
        date: selectedDate // Ensure we log for the selected date
      });
      fetchHydrationLogs(); // Refresh logs and total
    } catch (error) {
      console.error('Error logging water:', error);
    }
  };

  const updateHydration = async (id, amount) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/hydration/${id}`, { amount });
      setEditingLog(null);
      fetchHydrationLogs();
    } catch (error) {
      console.error('Error updating water:', error);
    }
  };

  const deleteHydration = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/hydration/${id}`);
      fetchHydrationLogs();
    } catch (error) {
      console.error('Error deleting water:', error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  // Chart Data
  const macroData = [
    { name: 'Protein', value: summary.protein, color: '#10B981' }, // green-500
    { name: 'Carbs', value: summary.carbs, color: '#3B82F6' },    // blue-500
    { name: 'Fats', value: summary.fat, color: '#F59E0B' },       // amber-500
  ];

  // Filter out zero values for cleaner chart
  const activeMacroData = macroData.filter(d => d.value > 0);

  const caloriePercentage = Math.min((summary.calories / calorieGoal) * 100, 100);
  let calorieStatus = "Keep going!";
  let calorieColor = "text-blue-600";

  if (summary.calories > calorieGoal) {
    calorieStatus = "Goal exceeded!";
    calorieColor = "text-red-500";
  } else if (caloriePercentage >= 100) {
    calorieStatus = "Goal reached!";
    calorieColor = "text-green-600";
  } else if (caloriePercentage >= 75) {
    calorieStatus = "Almost there!";
    calorieColor = "text-orange-500";
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">Navigation</h2>
              <nav className="space-y-1">
                {sections.map(({ id, label, icon: Icon, to }) => (
                  <Link
                    key={id}
                    to={to || '#'}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors
                      ${id === 'overview'
                        ? 'bg-green-50 text-green-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    <Icon className={`h-5 w-5 ${id === 'overview' ? 'text-green-600' : 'text-gray-400'}`} />
                    <span>{label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-[300px]">
              <h3 className="font-bold text-gray-900 mb-2">Daily Goal</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Target Calories</span>
                {!isEditingGoal ? (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{calorieGoal}</span>
                    <button onClick={() => setIsEditingGoal(true)} className="text-gray-400 hover:text-green-600">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={calorieGoal}
                      onChange={(e) => setCalorieGoal(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    <button onClick={updateCalorieGoal} className="text-green-600 hover:text-green-700">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full ${summary.calories > calorieGoal ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min((summary.calories / calorieGoal) * 100, 100)}%` }}
                ></div>
              </div>
              <p className={`text-xs font-medium text-right ${calorieColor}`}>
                {calorieStatus}
              </p>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 relative overflow-hidden">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Hello, {userProfile?.displayName || user.email?.split('@')[0]}! 👋
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-gray-500">Overview for:</p>
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
                      <button
                        onClick={() => handleDateChange(-1)}
                        className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <div className="flex items-center gap-2 px-3">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {selectedDate === getLocalDateString() ? 'Today' : selectedDate}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDateChange(1)}
                        className="p-1 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                        disabled={selectedDate === getLocalDateString()}
                      >
                        <ChevronRight className={`h-4 w-4 ${selectedDate === getLocalDateString() ? 'text-gray-300' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="px-4 py-3 bg-green-50 rounded-lg border border-green-100 text-center min-w-[100px]">
                    <p className="text-xs text-green-600 font-semibold uppercase tracking-wider">Calories</p>
                    <p className="text-xl font-bold text-green-700">{summary.calories}</p>
                  </div>
                  <div className="px-4 py-3 bg-blue-50 rounded-lg border border-blue-100 text-center min-w-[100px]">
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Meals</p>
                    <p className="text-xl font-bold text-blue-700">{meals.length}</p>
                  </div>
                </div>
              </div>

              {/* Decorative background element */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-green-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
            </section>

            {/* Daily Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hydration Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <Droplets className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Hydration</h3>
                      {!isEditingHydrationGoal ? (
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-500">Daily Goal: {hydrationGoal}ml</p>
                          <button onClick={() => setIsEditingHydrationGoal(true)} className="text-gray-400 hover:text-blue-600">
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            value={hydrationGoal}
                            onChange={(e) => setHydrationGoal(Number(e.target.value))}
                            className="w-16 px-1 py-0.5 text-sm border border-gray-300 rounded"
                            autoFocus
                          />
                          <span className="text-xs text-gray-500">ml</span>
                          <button onClick={updateHydrationGoal} className="text-green-600 hover:text-green-700">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {summary.hydration}<span className="text-sm text-gray-400 font-normal ml-1">ml</span>
                  </span>
                </div>

                <div className="relative pt-2 pb-6">
                  <div className="mb-2 flex justify-between text-xs font-medium text-gray-500">
                    <span>0ml</span>
                    <span>Target: {hydrationGoal}ml</span>
                  </div>
                  <div className="w-full bg-blue-50 rounded-full h-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((summary.hydration / hydrationGoal) * 100, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    ></motion.div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => logWater(250)}
                    className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Water (250ml)
                  </button>

                  {/* Hydration Logs List */}
                  {hydrationLogs.length > 0 && (
                    <div className="space-y-2 mt-4 max-h-40 overflow-y-auto pr-1">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">History</p>
                      {hydrationLogs.map(log => (
                        <div key={log._id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg group">
                          {editingLog === log._id ? (
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="number"
                                defaultValue={log.amount}
                                autoFocus
                                className="w-16 px-1 py-0.5 border rounded"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') updateHydration(log._id, Number(e.currentTarget.value));
                                }}
                              />
                              <span className="text-gray-500 text-xs">ml</span>
                              <div className="flex ml-auto gap-1">
                                <button onClick={() => setEditingLog(null)} className="p-1 text-gray-400 hover:text-gray-600"><X className="h-3 w-3" /></button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className="text-gray-600 font-medium">{log.amount}ml</span>
                              <span className="text-xs text-gray-400">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingLog(log._id)} className="p-1 text-gray-400 hover:text-blue-600">
                                  <Edit2 className="h-3 w-3" />
                                </button>
                                <button onClick={() => deleteHydration(log._id)} className="p-1 text-gray-400 hover:text-red-500">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Macros Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <PieChart className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-gray-900">Nutrition Breakdown</h3>
                </div>

                <div className="flex items-center justify-between h-48">
                  {summary.calories === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <div className="p-3 bg-gray-50 rounded-full mb-2">
                        <Utensils className="h-6 w-6" />
                      </div>
                      <p className="text-sm">Log meals to see breakdown</p>
                    </div>
                  ) : (
                    <div className="w-full h-full flex">
                      <ResponsiveContainer width="50%" height="100%">
                        <PieChart>
                          <Pie
                            data={activeMacroData}
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {activeMacroData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="w-1/2 flex flex-col justify-center gap-3 pl-4">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-gray-600">Protein</span>
                          </div>
                          <span className="font-bold text-gray-900">{summary.protein}g</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-gray-600">Carbs</span>
                          </div>
                          <span className="font-bold text-gray-900">{summary.carbs}g</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span className="text-gray-600">Fats</span>
                          </div>
                          <span className="font-bold text-gray-900">{summary.fat}g</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Quick Actions Grid */}
            <h2 className="text-xl font-bold text-gray-900 pt-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "Log Meal",
                  desc: "Track breakfast, lunch, or dinner",
                  icon: ClipboardList,
                  color: "bg-green-100 text-green-700",
                  to: "/dashboard/meal-tracking"
                },
                {
                  title: "Meal Plans",
                  desc: "Get personalized diet plans",
                  icon: Utensils,
                  color: "bg-purple-100 text-purple-700",
                  to: "/dashboard/meal-plans"
                },
                {
                  title: "Recipe Lab",
                  desc: "Find inspiration for cooking",
                  icon: ChefHat,
                  color: "bg-orange-100 text-orange-700",
                  to: "/dashboard/recipe-lab"
                },
                {
                  title: "Health Tips",
                  desc: "Daily advice for better health",
                  icon: Lightbulb,
                  color: "bg-yellow-100 text-yellow-700",
                  to: "/dashboard/health-tips"
                }
              ].map((action, i) => (
                <Link to={action.to} key={i} className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">{action.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
                </Link>
              ))}
            </div>

            {/* Meal Reminders */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-bold text-gray-900">Daily Reminders</h2>
              </div>
              <MealReminderManager userId={user.uid} userEmail={user.email} />
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
