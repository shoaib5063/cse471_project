import axios from 'axios';

const API_URL = import.meta.env?.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/meals` : '/api/meals';

export const getNutrientTrends = async (userId, days = 7) => {
  const response = await axios.get(`${API_URL}/trends/${userId}?days=${days}`);
  return response.data;
};
