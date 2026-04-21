// src/services/foodService.ts
// ─── MOCK implementation ──────────────────────────────────────────────────────
import foodData from '../data/food.json';

// In-memory store for mock logs (resets on app restart)
let mockLogs = [...foodData.today.meals].map((m) => ({ ...m })) as any[];
let nextId = mockLogs.length + 1;

function recalcTotals() {
  return {
    calories: mockLogs.reduce((s, l) => s + l.calories, 0),
    protein:  mockLogs.reduce((s, l) => s + (l.protein  || 0), 0),
    carbs:    mockLogs.reduce((s, l) => s + (l.carbs    || 0), 0),
    fats:     mockLogs.reduce((s, l) => s + (l.fats     || 0), 0),
    fiber:    mockLogs.reduce((s, l) => s + (l.fiber    || 0), 0),
  };
}

export const foodService = {
  async getLogs(_date?: string) {
    await new Promise((r) => setTimeout(r, 300));
    return {
      logs: mockLogs,
      totals: recalcTotals(),
      trend: foodData.calorieTrend,
    };
  },

  async addLog(log: {
    mealType: string; foodName: string; calories: number;
    protein?: number; carbs?: number; fats?: number; fiber?: number;
    calcium?: number; iron?: number; magnesium?: number; time?: string;
  }) {
    const newLog = {
      id: `meal_new_${nextId++}`,
      mealType:  log.mealType,
      foodName:  log.foodName,
      calories:  log.calories,
      protein:   log.protein   || 0,
      carbs:     log.carbs     || 0,
      fats:      log.fats      || 0,
      fiber:     log.fiber     || 0,
      calcium:   log.calcium,
      iron:      log.iron,
      magnesium: log.magnesium,
      time:      log.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    mockLogs.push(newLog);
    return newLog;
  },

  async removeLog(id: string) {
    mockLogs = mockLogs.filter((l) => l.id !== id);
    return { success: true };
  },

  getFoodDatabase() {
    return foodData.foodDatabase;
  },
};
