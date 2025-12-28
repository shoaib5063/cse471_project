import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Users, Activity, TrendingUp, Database, Ban, CheckCircle, Plus, Upload } from 'lucide-react';
import axios from 'axios';
import RecipeCreationForm from '../components/admin/RecipeCreationForm';
import ChallengeUploadForm from '../components/admin/ChallengeUploadForm';

export default function AdminPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeMeals: 0,
    avgCalories: 0,
  });
  const [users, setUsers] = useState([]);
  const [adminInfo, setAdminInfo] = useState(null);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false);

  useEffect(() => {
    // Check admin session
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      navigate('/auth');
      return;
    }
    
    try {
      const session = JSON.parse(adminSession);
      setAdminInfo(session);
      
      // Check if session is older than 24 hours
      if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('adminSession');
        navigate('/auth');
        return;
      }
    } catch (error) {
      navigate('/auth');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (adminInfo) {
      fetchAdminData();
    }
  }, [adminInfo]);

  const fetchAdminData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`);
      setStats(response.data.stats || {});
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/ban`);
      fetchAdminData();
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/unban`);
      fetchAdminData();
    } catch (error) {
      console.error('Error unbanning user:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    navigate('/auth');
  };

  const handleRecipeCreated = () => {
    fetchAdminData();
  };

  const handleChallengeCreated = () => {
    fetchAdminData();
  };

  if (!adminInfo) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage users and monitor platform statistics</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Meals</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeMeals}</p>
              </div>
              <Activity className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Calories</p>
                <p className="text-3xl font-bold text-gray-900">{stats.avgCalories}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Database</p>
                <p className="text-3xl font-bold text-green-600">✓</p>
              </div>
              <Database className="h-12 w-12 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Admin Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recipe Management</h3>
              <Plus className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-gray-600 mb-4">Create and manage recipes</p>
            <button 
              onClick={() => setShowRecipeForm(true)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add New Recipe
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Challenge Management</h3>
              <Upload className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-gray-600 mb-4">Upload and manage challenges</p>
            <button 
              onClick={() => setShowChallengeForm(true)}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Upload Challenge
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Analytics</h3>
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-gray-600 mb-4">View detailed user analytics</p>
            <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
              View Analytics
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'banned' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.status === 'banned' ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                          Edit
                        </button>
                        {user.status === 'banned' ? (
                          <button 
                            onClick={() => handleUnbanUser(user.id)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            <CheckCircle className="inline h-4 w-4 mr-1" />
                            Unban
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleBanUser(user.id)}
                            className="text-red-600 hover:text-red-900 mr-4"
                          >
                            <Ban className="inline h-4 w-4 mr-1" />
                            Ban
                          </button>
                        )}
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Recipe Creation Form Modal */}
      {showRecipeForm && (
        <RecipeCreationForm
          onClose={() => setShowRecipeForm(false)}
          onSuccess={handleRecipeCreated}
        />
      )}
      
      {/* Challenge Upload Form Modal */}
      {showChallengeForm && (
        <ChallengeUploadForm
          onClose={() => setShowChallengeForm(false)}
          onSuccess={handleChallengeCreated}
        />
      )}
    </div>
  );
}
