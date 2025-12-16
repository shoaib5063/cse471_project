/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @returns {number} BMR in calories
 */
export function calculateBMR(weight, height, age, gender) {
  if (!weight || !height || !age || !gender) {
    return null;
  }

  // Mifflin-St Jeor Equation
  // Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
  // Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
  
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  
  if (gender.toLowerCase() === 'male') {
    return baseBMR + 5;
  } else if (gender.toLowerCase() === 'female') {
    return baseBMR - 161;
  }
  
  // Default to male calculation if gender is not specified
  return baseBMR + 5;
}

/**
 * Activity level multipliers for TDEE calculation
 */
const ACTIVITY_MULTIPLIERS = {
  'sedentary': 1.2,        // Little or no exercise
  'light': 1.375,          // Light exercise 1-3 days/week
  'moderate': 1.55,        // Moderate exercise 3-5 days/week
  'active': 1.725,         // Active exercise 6-7 days/week
  'very-active': 1.9,      // Very active exercise daily
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @param {string} activityLevel - Activity level key
 * @returns {number} TDEE in calories
 */
export function calculateTDEE(weight, height, age, gender, activityLevel) {
  const bmr = calculateBMR(weight, height, age, gender);
  
  if (!bmr) {
    return null;
  }

  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS['sedentary'];
  return Math.round(bmr * multiplier);
}

/**
 * Calculate calorie goal based on user profile
 * @param {object} userProfile - User profile object
 * @returns {number} Calorie goal in calories, or 2000 as default
 */
export function calculateCalorieGoal(userProfile) {
  if (!userProfile) {
    return 2000; // Default fallback
  }

  const weight = parseFloat(userProfile.weight);
  const height = parseFloat(userProfile.height);
  const age = parseInt(userProfile.age);
  const gender = userProfile.gender;
  const activityLevel = userProfile.activityLevel;

  // Check if we have all required data
  if (!weight || !height || !age || !gender || !activityLevel) {
    return 2000; // Default fallback
  }

  const tdee = calculateTDEE(weight, height, age, gender, activityLevel);
  return tdee || 2000;
}

