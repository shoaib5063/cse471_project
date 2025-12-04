export interface UserProfile {
  uid: string;
  email: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  weight?: number; // in kg
  height?: number; // in cm
  dietaryPreferences?: string[];
  healthGoals?: string[];
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  createdAt: Date;
  updatedAt: Date;
}

export interface BMIData {
  bmi: number;
  category: string;
  dailyCalories: number;
}
