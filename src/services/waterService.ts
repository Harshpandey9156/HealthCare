// src/services/waterService.ts
// ─── MOCK implementation ──────────────────────────────────────────────────────
import waterData from '../data/water.json';

let mockLogs = [...waterData.logs].map((l) => ({ ...l })) as any[];
let mockTotal = waterData.total;
let nextId = mockLogs.length + 1;

export const waterService = {
  async getLogs(_date?: string) {
    await new Promise((r) => setTimeout(r, 300));
    return {
      logs:        mockLogs,
      total:       mockTotal,
      goal:        waterData.goal,
      weeklyTrend: waterData.weeklyTrend,
    };
  },

  async addLog(amount: number) {
    const newLog = {
      id:     `water_new_${nextId++}`,
      amount,
      time:   new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    mockLogs.push(newLog);
    mockTotal = parseFloat((mockTotal + amount).toFixed(2));
    return newLog;
  },
};
