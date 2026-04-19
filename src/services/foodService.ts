// src/services/foodService.ts
import api from './api';

export const foodService = {
  async getLogs(date?: string) {
    const params = date ? { date } : {};
    const { data } = await api.get('/food', { params });
    return data; // { logs, totals, trend }
  },

  async addLog(log: {
    mealType: string; foodName: string; calories: number;
    protein?: number; carbs?: number; fats?: number; fiber?: number;
    calcium?: number; iron?: number; magnesium?: number; date?: string;
  }) {
    const { data } = await api.post('/food', log);
    return data.log;
  },

  async removeLog(id: string) {
    const { data } = await api.delete(`/food/${id}`);
    return data;
  },
};
