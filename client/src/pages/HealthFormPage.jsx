import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const HealthFormPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    fitnessGoal: '',
    medicalConditions: [],
    allergies: [],
    dietaryRestrictions: []
  });

  const [allergyInput, setAllergyInput] = useState('');

  useEffect(() => {
    const loadHealthProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/health/${currentUser.uid}/health-profile`
        );
        if (response.data.data) {
          const profile = response.data.data;
          setFormData({
            age: profile.age || '',
            gender: profile.gender || '',
            height: profile.height || '',
            weight: profile.weight || '',
            activityLevel: profile.activityLevel || '',
            fitnessGoal: profile.fitnessGoal || '',
            medicalConditions: profile.medicalConditions || [],
            allergies: profile.allergies || [],
            dietaryRestrictions: profile.dietaryRestrictions || []
          });
          setSuggestions(profile.dietarySuggestions || null);
        }
      } catch (error) {
        console.error('Error loading health profile:', error);
      }
    };

    if (currentUser) {
      loadHealthProfile();
    }
  }, [currentUser]);

  const handleCheckboxChange = (category, value) => {
    setFormData(prev => {
      const current = prev[category];
      if (current.includes(value)) {
        return {
          ...prev,
          [category]: current.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [category]: [...current, value]
        };
      }
    });
  };

  const handleAddAllergy = () => {
    if (allergyInput.trim()) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergyInput.trim()]
      }));
      setAllergyInput('');
    }
  };

  const handleRemoveAllergy = (index) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/health/${currentUser.uid}/health-form`,
        formData
      );

      setSuggestions(response.data.data.suggestions);
      
      alert('Health form submitted successfully! View your personalized suggestions below.');
    } catch (error) {
      console.error('Error submitting health form:', error);
      alert('Failed to submit health form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏥 Health Profile Assessment
            </h1>
            <p className="text-gray-600">
              Complete this form to receive personalized dietary recommendations
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-900">
                Basic Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your age"
                    min="1"
                    max="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 170"
                    min="50"
                    max="300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 70"
                    min="20"
                    max="500"
                  />
                </div>
              </div>
            </div>

            {/* Activity & Goals */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-green-900">
                Activity & Goals
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Level *
                  </label>
                  <select
                    required
                    value={formData.activityLevel}
                    onChange={(e) => setFormData({...formData, activityLevel: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select activity level</option>
                    <option value="sedentary">Sedentary (little or no exercise)</option>
                    <option value="light">Light (exercise 1-3 days/week)</option>
                    <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                    <option value="active">Active (exercise 6-7 days/week)</option>
                    <option value="very_active">Very Active (intense exercise daily)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fitness Goal *
                  </label>
                  <select
                    required
                    value={formData.fitnessGoal}
                    onChange={(e) => setFormData({...formData, fitnessGoal: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select your goal</option>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="maintain">Maintain Current Weight</option>
                    <option value="general_health">General Health Improvement</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Medical Conditions */}
            <div className="bg-red-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-red-900">
                Medical Conditions
              </h2>
              <p className="text-sm text-gray-600 mb-3">Select all that apply</p>
              
              <div className="grid md:grid-cols-2 gap-3">
                {['diabetes', 'hypertension', 'heart_disease', 'thyroid', 'pcos', 'none'].map(condition => (
                  <label key={condition} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.medicalConditions.includes(condition)}
                      onChange={() => handleCheckboxChange('medicalConditions', condition)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-gray-700 capitalize">{condition.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div className="bg-orange-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-orange-900">
                Allergies
              </h2>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Type an allergy and press Add"
                />
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.allergies.map((allergy, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-orange-200 text-orange-900 rounded-full"
                  >
                    {allergy}
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(index)}
                      className="text-orange-700 hover:text-orange-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="bg-purple-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-purple-900">
                Dietary Restrictions
              </h2>
              <p className="text-sm text-gray-600 mb-3">Select all that apply</p>
              
              <div className="grid md:grid-cols-2 gap-3">
                {['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'keto', 'halal', 'kosher', 'none'].map(restriction => (
                  <label key={restriction} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.dietaryRestrictions.includes(restriction)}
                      onChange={() => handleCheckboxChange('dietaryRestrictions', restriction)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-gray-700 capitalize">{restriction.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Processing...' : 'Get Dietary Suggestions'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Suggestions Display */}
          {suggestions && suggestions.length > 0 && (
            <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
              <h2 className="text-2xl font-bold mb-4 text-green-900 flex items-center gap-2">
                <span>✨</span> Your Personalized Dietary Suggestions
              </h2>
              
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${getPriorityColor(suggestion.priority)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{suggestion.category}</h3>
                      <span className="text-xs font-bold uppercase px-2 py-1 rounded">
                        {suggestion.priority}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{suggestion.suggestion}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600">
                  <strong>💡 Tip:</strong> These suggestions are saved to your profile and can be accessed anytime. 
                  Remember to consult with a healthcare professional before making major dietary changes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthFormPage;
