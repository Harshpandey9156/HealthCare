// src/services/userService.ts
import api from './api';

export const userService = {
  async getProfile() {
    const { data } = await api.get('/user/profile');
    return data; // { user, leaderboard }
  },

  async updateProfile(updates: {
    name?: string; age?: number; gender?: string; height?: number;
    weight?: number; targetWeight?: number; calorieGoal?: number;
    waterGoal?: number; activityLevel?: string; theme?: string; avatar?: string;
  }) {
    const { data } = await api.patch('/user/profile', updates);
    return data.user;
  },
};
