import axios from 'axios';
const BASE = import.meta.env?.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/grocery` : '/api/grocery';

export const generateGroceryList = async (mealPlan) => {
  const res = await axios.post(`${BASE}/generate`, { mealPlan });
  return res.data;
};
