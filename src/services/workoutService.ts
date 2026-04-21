// src/services/workoutService.ts
// ─── MOCK implementation ──────────────────────────────────────────────────────
import workoutData from '../data/workout.json';

let mockLogs = [...workoutData.logs].map((l) => ({ ...l })) as any[];
let nextId = mockLogs.length + 1;

export const workoutService = {
  async getLogs(_date?: string) {
    await new Promise((r) => setTimeout(r, 300));
    return {
      logs:         mockLogs,
      allLogs:      mockLogs,
      weeklyMinutes: workoutData.weeklyMinutes,
      weeklyPlan:   workoutData.weeklyPlan,
    };
  },

  async addLog(log: {
    date: string; name: string; workoutType: string;
    duration: number; caloriesBurned: number; intensity: string; emoji: string;
  }) {
    const newLog = { id: `w_new_${nextId++}`, ...log };
    mockLogs.unshift(newLog);
    return newLog;
  },

  async removeLog(id: string) {
    mockLogs = mockLogs.filter((l) => l.id !== id);
    return { success: true };
  },

  getWeeklyPlan() {
    return workoutData.weeklyPlan;
  },
};
