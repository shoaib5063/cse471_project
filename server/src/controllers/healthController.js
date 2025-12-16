const User = require('../models/User');

// Generate dietary suggestions based on health profile
const generateDietarySuggestions = (healthProfile) => {
  const suggestions = [];
  
  // Calculate BMI if height and weight available
  let bmi = null;
  if (healthProfile.height && healthProfile.weight) {
    const heightInMeters = healthProfile.height / 100;
    bmi = healthProfile.weight / (heightInMeters * heightInMeters);
  }
  
  // BMI-based suggestions
  if (bmi) {
    if (bmi < 18.5) {
      suggestions.push({
        category: 'Weight Management',
        suggestion: 'Your BMI indicates you are underweight. Focus on nutrient-dense, calorie-rich foods like nuts, avocados, and whole grains.',
        priority: 'high'
      });
    } else if (bmi >= 25 && bmi < 30) {
      suggestions.push({
        category: 'Weight Management',
        suggestion: 'Your BMI indicates you are overweight. Consider a balanced diet with portion control and regular physical activity.',
        priority: 'high'
      });
    } else if (bmi >= 30) {
      suggestions.push({
        category: 'Weight Management',
        suggestion: 'Your BMI indicates obesity. Consult a healthcare provider and focus on gradual, sustainable weight loss through diet and exercise.',
        priority: 'high'
      });
    }
  }
  
  // Fitness goal-based suggestions
  if (healthProfile.fitnessGoal === 'weight_loss') {
    suggestions.push({
      category: 'Nutrition',
      suggestion: 'Create a calorie deficit by consuming 300-500 calories less than your maintenance level. Focus on high-protein, high-fiber foods.',
      priority: 'high'
    });
    suggestions.push({
      category: 'Meal Planning',
      suggestion: 'Eat smaller, frequent meals throughout the day to maintain metabolism and reduce hunger.',
      priority: 'medium'
    });
  } else if (healthProfile.fitnessGoal === 'muscle_gain') {
    suggestions.push({
      category: 'Nutrition',
      suggestion: 'Increase protein intake to 1.6-2.2g per kg body weight. Include lean meats, eggs, legumes, and protein supplements.',
      priority: 'high'
    });
    suggestions.push({
      category: 'Meal Timing',
      suggestion: 'Consume protein within 30 minutes after workouts for optimal muscle recovery.',
      priority: 'medium'
    });
  }
  
  // Medical condition-based suggestions
  if (healthProfile.medicalConditions?.includes('diabetes')) {
    suggestions.push({
      category: 'Blood Sugar Control',
      suggestion: 'Choose low glycemic index foods. Avoid refined sugars and white bread. Include more vegetables, whole grains, and lean proteins.',
      priority: 'high'
    });
    suggestions.push({
      category: 'Meal Timing',
      suggestion: 'Eat regular meals at consistent times to help manage blood sugar levels.',
      priority: 'high'
    });
  }
  
  if (healthProfile.medicalConditions?.includes('hypertension')) {
    suggestions.push({
      category: 'Heart Health',
      suggestion: 'Reduce sodium intake to less than 2,300mg per day. Increase potassium-rich foods like bananas, spinach, and sweet potatoes.',
      priority: 'high'
    });
    suggestions.push({
      category: 'Diet Pattern',
      suggestion: 'Follow a DASH diet rich in fruits, vegetables, whole grains, and low-fat dairy products.',
      priority: 'medium'
    });
  }
  
  if (healthProfile.medicalConditions?.includes('heart_disease')) {
    suggestions.push({
      category: 'Heart Health',
      suggestion: 'Limit saturated fats and trans fats. Include omega-3 rich foods like salmon, walnuts, and flaxseeds.',
      priority: 'high'
    });
  }
  
  // Activity level-based suggestions
  if (healthProfile.activityLevel === 'sedentary') {
    suggestions.push({
      category: 'Lifestyle',
      suggestion: 'Your sedentary lifestyle requires fewer calories. Focus on nutrient-dense foods and avoid empty calories.',
      priority: 'medium'
    });
  } else if (healthProfile.activityLevel === 'very_active') {
    suggestions.push({
      category: 'Energy',
      suggestion: 'Your high activity level requires more calories and carbohydrates. Include complex carbs and stay well-hydrated.',
      priority: 'medium'
    });
  }
  
  // Dietary restriction suggestions
  if (healthProfile.dietaryRestrictions?.includes('vegetarian') || 
      healthProfile.dietaryRestrictions?.includes('vegan')) {
    suggestions.push({
      category: 'Nutrients',
      suggestion: 'Ensure adequate protein, vitamin B12, iron, and omega-3 intake through fortified foods or supplements.',
      priority: 'medium'
    });
  }
  
  // General healthy eating suggestion
  suggestions.push({
    category: 'General Health',
    suggestion: 'Aim for 5 servings of fruits and vegetables daily. Stay hydrated with 8-10 glasses of water.',
    priority: 'low'
  });
  
  return suggestions;
};

// Submit health form and get suggestions
exports.submitHealthForm = async (req, res) => {
  try {
    const { userId } = req.params;
    const healthData = req.body;
    
    // Generate suggestions based on input
    const suggestions = generateDietarySuggestions(healthData);
    
    // Update or create user with health profile
    const user = await User.findOneAndUpdate(
      { firebaseUid: userId },
      {
        $set: {
          'healthProfile': {
            ...healthData,
            dietarySuggestions: suggestions,
            lastHealthFormUpdate: new Date()
          }
        }
      },
      { 
        new: true, 
        upsert: true, 
        setDefaultsOnInsert: true 
      }
    );
    
    res.json({
      success: true,
      data: {
        healthProfile: user.healthProfile,
        suggestions: suggestions
      },
      message: 'Health form submitted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's health profile and suggestions
exports.getHealthProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findOne({ firebaseUid: userId });
    
    if (!user || !user.healthProfile) {
      return res.json({
        success: true,
        data: null,
        message: 'No health profile found'
      });
    }
    
    res.json({
      success: true,
      data: user.healthProfile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
