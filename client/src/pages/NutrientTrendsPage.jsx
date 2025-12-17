import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getNutrientTrends } from '../lib/services/mealService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { ArrowLeft, TrendingUp, Activity, PieChart as PieIcon, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const NutrientTrendsPage = () => {
  const { user } = useAuth();
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrends = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const data = await getNutrientTrends(user.uid || user.id, days);
        setTrends(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load nutrient trends');
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [user, days]);

  const calculateAverage = (key) => {
    if (trends.length === 0) return 0;
    const sum = trends.reduce((acc, curr) => acc + (curr[key] || 0), 0);
    return Math.round(sum / trends.length);
  };

  const avgCalories = calculateAverage('calories');
  const avgProtein = calculateAverage('protein');
  const avgCarbs = calculateAverage('carbs');
  const avgFat = calculateAverage('fat');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const macroData = [
    { name: 'Protein', value: avgProtein * 4 }, // 4 cal/g
    { name: 'Carbs', value: avgCarbs * 4 },     // 4 cal/g
    { name: 'Fat', value: avgFat * 9 }          // 9 cal/g
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nutrient Trends</h1>
              <p className="text-gray-600">Analyze your intake patterns over time</p>
            </div>
          </div>
          
          <div className="flex bg-white rounded-lg shadow-sm p-1">
            {[7, 14, 30].map(d => (
              <button 
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  days === d 
                    ? 'bg-green-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Last {d} Days
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-600">Avg Calories</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{avgCalories}</p>
            <p className="text-sm text-gray-500 mt-1">kcal / day</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-600">Avg Protein</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{avgProtein}g</p>
            <p className="text-sm text-gray-500 mt-1">~{Math.round((avgProtein * 4 / avgCalories) * 100 || 0)}% of intake</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <PieIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <h3 className="font-medium text-gray-600">Avg Carbs</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{avgCarbs}g</p>
            <p className="text-sm text-gray-500 mt-1">~{Math.round((avgCarbs * 4 / avgCalories) * 100 || 0)}% of intake</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-medium text-gray-600">Avg Fat</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{avgFat}g</p>
            <p className="text-sm text-gray-500 mt-1">~{Math.round((avgFat * 9 / avgCalories) * 100 || 0)}% of intake</p>
          </div>
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calorie Trend */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Calorie Intake History</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => {
                      const d = new Date(str);
                      return `${d.getMonth()+1}/${d.getDate()}`;
                    }}
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="calories" 
                    stroke="#16a34a" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCal)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Macro Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Caloric Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-500 text-center">
                Based on average intake over the selected period.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Macro Trends */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Macronutrient Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(str) => {
                    const d = new Date(str);
                    return `${d.getMonth()+1}/${d.getDate()}`;
                  }}
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false}/>
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <Bar dataKey="protein" stackId="a" fill="#0088FE" name="Protein (g)" radius={[0, 0, 4, 4]} />
                <Bar dataKey="carbs" stackId="a" fill="#FFBB28" name="Carbs (g)" />
                <Bar dataKey="fat" stackId="a" fill="#FF8042" name="Fat (g)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights / Suggestions */}
        <div className="bg-green-50 rounded-xl p-6 border border-green-100">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Insights & Adjustments</h3>
          <div className="space-y-3">
            {avgProtein < 50 && (
              <p className="text-green-800 flex items-start gap-2">
                <span className="mt-1">•</span>
                Your protein intake is slightly low. Consider adding more lean meats, eggs, or legumes to your meals to support muscle health.
              </p>
            )}
            {avgCalories > 2500 && (
              <p className="text-green-800 flex items-start gap-2">
                <span className="mt-1">•</span>
                Your average calorie intake is on the higher side. If your goal is weight loss, try reducing portion sizes or increasing vegetable intake.
              </p>
            )}
            {avgFat > 80 && (
              <p className="text-green-800 flex items-start gap-2">
                <span className="mt-1">•</span>
                Fat intake is relatively high. Ensure these are healthy fats (avocado, nuts, olive oil) rather than saturated fats.
              </p>
            )}
            {trends.length > 0 && trends[trends.length-1].calories === 0 && (
              <p className="text-green-800 flex items-start gap-2">
                <span className="mt-1">•</span>
                You haven't logged any meals for today yet. Consistency is key!
              </p>
            )}
            <p className="text-green-800 flex items-start gap-2">
              <span className="mt-1">•</span>
              Great job tracking for {days} days! Regular tracking helps identify patterns you might miss otherwise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutrientTrendsPage;
