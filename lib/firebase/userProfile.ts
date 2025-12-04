import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { UserProfile, BMIData } from '../types/user';

export const createUserProfile = async (uid: string, email: string) => {
  const userRef = doc(db, 'users', uid);
  const profile: UserProfile = {
    uid,
    email,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await setDoc(userRef, profile);
  return profile;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const calculateBMI = (weight: number, height: number): BMIData => {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  let category = '';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal weight';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';
  
  return { bmi: parseFloat(bmi.toFixed(1)), category, dailyCalories: 0 };
};

export const calculateDailyCalories = (
  weight: number,
  height: number,
  age: number,
  gender: string,
  activityLevel: string
): number => {
  let bmr: number;
  
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  
  const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.2;
  return Math.round(bmr * multiplier);
};
