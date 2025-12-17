import axios from 'axios';
const BASE = import.meta.env?.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/challenges`
  : '/api/challenges';

export const getActiveChallenges = async () => {
  const response = await axios.get(`${BASE}/active`);
  return response.data;
};

export const getUserChallenges = async (userId) => {
  const response = await axios.get(`${BASE}/my`, {
    params: { userId }
  });
  return response.data;
};

export const joinChallenge = async (challengeId, userId) => {
  const response = await axios.post(`${BASE}/${challengeId}/join`, { userId });
  return response.data;
};
