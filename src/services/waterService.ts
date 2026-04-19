// src/services/waterService.ts
import api from './api';

export const waterService = {
  async getLogs(date?: string) {
    const params = date ? { date } : {};
    const { data } = await api.get('/water', { params });
    return data; // { logs, total, goal, weeklyTrend }
  },

  async addLog(amount: number, date?: string) {
    const { data } = await api.post('/water', {
      amount,
      date: date || new Date().toISOString().split('T')[0],
    });
    return data.log;
  },
};
