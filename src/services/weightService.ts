// src/services/weightService.ts
import api from './api';

export const weightService = {
  async getLogs() {
    const { data } = await api.get('/weight');
    return data.logs;
  },

  async addLog(log: { weight: number; bmi: number; date?: string; note?: string }) {
    const { data } = await api.post('/weight', {
      ...log,
      date: log.date || new Date().toISOString().split('T')[0],
    });
    return data.log;
  },
};
