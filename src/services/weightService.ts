// src/services/weightService.ts
// ─── MOCK implementation ──────────────────────────────────────────────────────
import weightData from '../data/weight.json';

let mockLogs = [...(weightData as any).logs || []].map((l: any) => ({ ...l }));
let nextId = mockLogs.length + 1;

export const weightService = {
  async getLogs() {
    await new Promise((r) => setTimeout(r, 300));
    return mockLogs;
  },

  async addLog(log: { date: string; weight: number; bmi: number }) {
    const newLog = { id: `wt_new_${nextId++}`, ...log };
    mockLogs.unshift(newLog);
    return newLog;
  },
};
