import React, { useState, useRef } from 'react';
import { Upload, X, Loader } from 'lucide-react';
import axios from 'axios';

export default function ImageFoodAnalyzer({ onFoodsDetected, onClose }) {
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectedFoods, setDetectedFoods] = useState([]);
  const [showSearchUI, setShowSearchUI] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setSelectedImage(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imageBase64 = e.target.result;

          // Call backend API
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/meals/analyze-image`,
            { imageBase64 }
          );

          if (response.data.success && Array.isArray(response.data.foods) && response.data.foods.length > 0) {
            setDetectedFoods(response.data.foods);
            setShowSearchUI(false);
          } else if (response.data.success && Array.isArray(response.data.foods) && response.data.foods.length === 0) {
            // No automatic detection — check server-provided candidates and auto-pick first
            setDetectedFoods([]);
            const candidates = Array.isArray(response.data.candidates) ? response.data.candidates : [];
            if (candidates.length > 0) {
              // Auto-select the first candidate and add it to the meal
              const top = candidates[0];
              const nutrition = top.nutrients || {};
              const formattedFood = {
                fatsecretFoodId: top.fdcId || top.id || null,
                foodName: top.description || top.food_entry_name || 'Food',
                description: top.description || top.food_entry_name || '',
                quantity: 1,
                servingSize: top.servingSize || 100,
                servingSizeUnit: top.servingSizeUnit || 'g',
                servingDescription: top.servingSizeUnit ? `1 ${top.servingSizeUnit}` : '1 serving',
                nutrients: {
                  calories: nutrition.calories || 0,
                  protein: nutrition.protein || 0,
                  carbs: nutrition.carbs || nutrition.carbohydrate || 0,
                  fat: nutrition.fat || 0,
                  fiber: nutrition.fiber || 0,
                  sugar: nutrition.sugar || 0,
                }
              };

              onFoodsDetected([formattedFood]);
              onClose();
            } else if (Array.isArray(response.data.suggestions) && response.data.suggestions.length > 0) {
              // Server provided suggestions from existing meals — auto-select first suggestion
              const top = response.data.suggestions[0];
              const formattedFood = {
                fatsecretFoodId: top.fdcId || null,
                foodName: top.description || 'Food',
                description: top.description || '',
                quantity: 1,
                servingSize: top.servingSize || 100,
                servingSizeUnit: top.servingSizeUnit || 'g',
                servingDescription: top.servingSizeUnit ? `1 ${top.servingSizeUnit}` : '1 serving',
                nutrients: {
                  calories: top.nutrients?.calories || 0,
                  protein: top.nutrients?.protein || 0,
                  carbs: top.nutrients?.carbs || top.nutrients?.carbohydrate || 0,
                  fat: top.nutrients?.fat || 0,
                  fiber: top.nutrients?.fiber || 0,
                  sugar: top.nutrients?.sugar || 0
                }
              };
              onFoodsDetected([formattedFood]);
              onClose();
            } else {
              // No candidates or suggestions — show search UI so user can search manually
              setShowSearchUI(true);
              const raw = response.data.rawResponse || {};
              const suggestion = raw.suggested_search_query || raw.top_label || '';
              if (suggestion) setSearchQuery(suggestion);
              setSearchResults([]);
              setError(null);
            }
          } else {
            setError('No foods detected in the image');
          }
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to analyze image');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(selectedImage);
    } catch (err) {
      setError('Failed to process image');
      setLoading(false);
    }
  };

  const handleSearchDatabase = async (q) => {
    const query = q || searchQuery;
    if (!query || query.trim().length === 0) {
      setError('Please enter a search query');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`${import.meta.env.VITE_API_URL}/api/meals/search`, { params: { query } });
      setSearchResults(resp.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    // Map USDA search result (or generic search result) to the app's meal format expected by onFoodsDetected
    const nutrition = result.nutrients || {};
    const formattedFood = {
      fatsecretFoodId: result.fdcId || result.id || null,
      foodName: result.description || result.food_entry_name || 'Food',
      description: result.description || result.food_entry_name || '',
      quantity: 1,
      servingSize: result.servingSize || 100,
      servingSizeUnit: result.servingSizeUnit || 'g',
      servingDescription: result.servingSizeUnit ? `1 ${result.servingSizeUnit}` : '1 serving',
      nutrients: {
        calories: nutrition.calories || 0,
        protein: nutrition.protein || 0,
        carbs: nutrition.carbs || nutrition.carbohydrate || 0,
        fat: nutrition.fat || 0,
        fiber: nutrition.fiber || 0,
        sugar: nutrition.sugar || 0,
      }
    };

    onFoodsDetected([formattedFood]);
    onClose();
  };

  const handleAddFood = (food) => {
    const selectedServing = food.suggested_serving;
    const nutrition = food.eaten.total_nutritional_content;

    const formattedFood = {
      fatsecretFoodId: food.food_id,
      foodName: food.food_entry_name,
      description: food.food_entry_name,
      quantity: 1,
      servingSize: selectedServing?.metric_measure_amount || 100,
      servingSizeUnit: selectedServing?.metric_serving_description || 'g',
      servingDescription: selectedServing?.serving_description || '1 serving',
      nutrients: {
        calories: nutrition.calories || 0,
        protein: nutrition.protein || 0,
        carbs: nutrition.carbohydrate || 0,
        fat: nutrition.fat || 0,
        fiber: nutrition.fiber || 0,
        sugar: nutrition.sugar || 0,
        saturated_fat: nutrition.saturated_fat || 0,
        cholesterol: nutrition.cholesterol || 0,
        sodium: nutrition.sodium || 0,
        potassium: nutrition.potassium || 0,
        vitamin_a: nutrition.vitamin_a || 0,
        vitamin_c: nutrition.vitamin_c || 0,
        calcium: nutrition.calcium || 0,
        iron: nutrition.iron || 0
      }
    };

    onFoodsDetected([formattedFood]);
    onClose();
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Analyze Food Image</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 py-6">
        <div className="space-y-6">
          {/* Image Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Upload Food Image
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                  setDetectedFoods([]);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Analyze Button */}
          {selectedImage && detectedFoods.length === 0 && (
            <button
              onClick={handleAnalyzeImage}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Image'
              )}
            </button>
          )}

          {/* Detected Foods */}
          {detectedFoods.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">
                Detected Foods ({detectedFoods.length})
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {detectedFoods.map((food, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {food.food_entry_name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {food.eaten.total_metric_amount} {food.eaten.metric_description}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        {Math.round(food.eaten.total_nutritional_content.calories)} cal
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="text-gray-600">
                        <span className="font-medium">Protein:</span> {food.eaten.total_nutritional_content.protein}g
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">Carbs:</span> {food.eaten.total_nutritional_content.carbohydrate}g
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">Fat:</span> {food.eaten.total_nutritional_content.fat}g
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">Fiber:</span> {food.eaten.total_nutritional_content.fiber}g
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddFood(food)}
                      className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Add to Meal
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setDetectedFoods([]);
                  setSelectedImage(null);
                  setImagePreview(null);
                  setError(null);
                }}
                className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Analyze Another Image
              </button>
            </div>
          )}

          {/* Search fallback UI when no automatic detection */}
          {showSearchUI && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">No automatic detection — search database</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search food database (e.g. 'banana', 'cheeseburger')"
                  className="flex-1 border rounded-lg p-2"
                />
                <button
                  onClick={() => handleSearchDatabase()}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  Search
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.length === 0 && (
                  <p className="text-xs text-gray-500">No search results yet.</p>
                )}
                {searchResults.map((res, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-gray-50 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{res.description || res.food_entry_name}</p>
                      <p className="text-xs text-gray-500">{res.brandName || ''}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleSelectSearchResult(res)} className="bg-green-600 text-white px-3 py-1 rounded-md text-sm">Add</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={() => { setShowSearchUI(false); setError(null); }} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
