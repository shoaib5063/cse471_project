import React, { useState, useEffect } from 'react';
import { X, Plus, Clock, Bell, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function MealReminderManager({ userId, userEmail }) {
  const [reminders, setReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    mealType: 'breakfast',
    reminderTime: '08:00',
    mealName: 'Breakfast',
  });

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', defaultTime: '08:00' },
    { value: 'lunch', label: 'Lunch', defaultTime: '12:00' },
    { value: 'dinner', label: 'Dinner', defaultTime: '18:00' },
    { value: 'snack', label: 'Snack', defaultTime: '15:00' },
  ];

  // Fetch user reminders
  useEffect(() => {
    fetchReminders();
  }, [userId]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/reminders/user/${userId}`
      );
      setReminders(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching reminders:', err);
      setError('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();

    // Check if reminder already exists for this meal type
    if (reminders.some((r) => r.mealType === formData.mealType)) {
      setError(`Reminder for ${formData.mealType} already exists`);
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/reminders`, {
        userId,
        mealType: formData.mealType,
        reminderTime: formData.reminderTime,
        mealName: formData.mealName,
        email: userEmail,
      });

      setSuccess(`Reminder for ${formData.mealType} created!`);
      setShowForm(false);
      setFormData({
        mealType: 'breakfast',
        reminderTime: '08:00',
        mealName: 'Breakfast',
      });
      fetchReminders();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create reminder');
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/reminders/${reminderId}`
      );
      setSuccess('Reminder deleted');
      fetchReminders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete reminder');
    }
  };

  const handleToggleReminder = async (reminder) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/reminders/${reminder._id}/toggle`
      );
      fetchReminders();
    } catch (err) {
      setError('Failed to toggle reminder');
    }
  };

  const handleUpdateTime = async (reminderId, newTime) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/reminders/${reminderId}`, {
        reminderTime: newTime,
      });
      fetchReminders();
      setSuccess('Reminder time updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update reminder');
    }
  };

  const handleMealTypeChange = (e) => {
    const selectedType = e.target.value;
    const selectedMeal = mealTypes.find((m) => m.value === selectedType);
    setFormData({
      ...formData,
      mealType: selectedType,
      reminderTime: selectedMeal?.defaultTime || '08:00',
      mealName: selectedMeal?.label || 'Meal',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Loading reminders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Meal Reminders</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          <Plus className="h-4 w-4" />
          Add Reminder
        </button>
      </div>

      {/* Add Reminder Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Create New Reminder</h4>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleCreateReminder} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Type
                </label>
                <select
                  value={formData.mealType}
                  onChange={handleMealTypeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {mealTypes.map((meal) => (
                    <option key={meal.value} value={meal.value}>
                      {meal.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reminder Time (24-hour)
                </label>
                <input
                  type="time"
                  value={formData.reminderTime}
                  onChange={(e) =>
                    setFormData({ ...formData, reminderTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meal Name (Optional)
              </label>
              <input
                type="text"
                value={formData.mealName}
                onChange={(e) =>
                  setFormData({ ...formData, mealName: e.target.value })
                }
                placeholder="e.g., Oatmeal with berries"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
              >
                Create Reminder
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No reminders set yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Create your first reminder to get email notifications
            </p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder._id}
              className={`bg-white border rounded-lg p-4 transition ${
                reminder.isActive
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={reminder.isActive}
                      onChange={() => handleToggleReminder(reminder)}
                      className="w-5 h-5 text-green-600 rounded"
                    />
                    <h4 className="font-semibold text-gray-900 capitalize">
                      {reminder.mealType}
                    </h4>
                    {reminder.mealName && (
                      <span className="text-sm text-gray-600">
                        • {reminder.mealName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="h-4 w-4 text-green-600" />
                      <input
                        type="time"
                        value={reminder.reminderTime}
                        onChange={(e) =>
                          handleUpdateTime(reminder._id, e.target.value)
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        reminder.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {reminder.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {reminder.lastSentAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last sent: {new Date(reminder.lastSentAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteReminder(reminder._id)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition ml-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-900">
          <strong>📧 How it works:</strong> You'll receive email reminders at your set times. Reminders are sent once per day at the specified time.
        </p>
      </div>
    </div>
  );
}
