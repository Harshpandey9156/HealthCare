// src/services/workoutService.ts
import api from './api';

export const workoutService = {
  async getLogs(date?: string) {
    const params = date ? { date } : {};
    const { data } = await api.get('/workout', { params });
    return data; // { logs, allLogs, weeklyMinutes }
  },

  async addLog(log: {
    name: string; workoutType: string; duration: number;
    caloriesBurned: number; intensity?: string; date?: string; notes?: string;
  }) {
    const { data } = await api.post('/workout', log);
    return data.log;
  },

  async removeLog(id: string) {
    const { data } = await api.delete(`/workout/${id}`);
    return data;
  },
};
