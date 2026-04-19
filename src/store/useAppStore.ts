// src/store/useAppStore.ts
import { create } from 'zustand';
import userData from '../data/user.json';
import foodData from '../data/food.json';
import weightData from '../data/weight.json';
import workoutData from '../data/workout.json';
import waterData from '../data/water.json';

export interface FoodLog {
  id: string;
  mealType: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  time: string;
  calcium?: number;
  iron?: number;
  magnesium?: number;
}

export interface WeightLog {
  id: string;
  date: string;
  weight: number;
  bmi: number;
}

export interface WorkoutLog {
  id: string;
  date: string;
  name: string;
  workoutType: string;
  duration: number;
  caloriesBurned: number;
  intensity: string;
  emoji: string;
}

export interface WaterLog {
  id: string;
  amount: number;
  time: string;
}

interface AppStore {
  // User
  user: typeof userData.user;

  // Food
  foodLogs: FoodLog[];
  calorieTrend: typeof foodData.calorieTrend;
  foodDatabase: typeof foodData.foodDatabase;
  addFoodLog: (log: Omit<FoodLog, 'id'>) => void;
  removeFoodLog: (id: string) => void;

  // Weight
  weightLogs: WeightLog[];
  addWeightLog: (log: Omit<WeightLog, 'id'>) => void;

  // Workout
  workoutLogs: WorkoutLog[];
  weeklyPlan: typeof workoutData.weeklyPlan;
  weeklyMinutes: typeof workoutData.weeklyMinutes;
  addWorkoutLog: (log: Omit<WorkoutLog, 'id'>) => void;
  removeWorkoutLog: (id: string) => void;

  // Water
  waterLogs: WaterLog[];
  waterTotal: number;
  waterGoal: number;
  weeklyWater: typeof waterData.weeklyTrend;
  addWater: (amount: number) => void;

  // Streaks
  streaks: typeof userData.streaks;

  // Leaderboard
  leaderboard: typeof userData.leaderboard;

  // Badges
  badges: typeof userData.badges;

  // Computed
  todayCalories: number;
  todayProtein: number;
  todayCarbs: number;
  todayFats: number;
  todayFiber: number;
}

export const useAppStore = create<AppStore>((set, get) => ({
  user: userData.user,
  foodLogs: foodData.today.meals as FoodLog[],
  calorieTrend: foodData.calorieTrend,
  foodDatabase: foodData.foodDatabase,

  weightLogs: weightData.logs,
  workoutLogs: workoutData.logs as WorkoutLog[],
  weeklyPlan: workoutData.weeklyPlan,
  weeklyMinutes: workoutData.weeklyMinutes,

  waterLogs: waterData.today.logs,
  waterTotal: waterData.today.total,
  waterGoal: waterData.today.goal,
  weeklyWater: waterData.weeklyTrend,

  streaks: userData.streaks,
  leaderboard: userData.leaderboard,
  badges: userData.badges,

  todayCalories: foodData.today.totalCalories,
  todayProtein: foodData.today.totalProtein,
  todayCarbs: foodData.today.totalCarbs,
  todayFats: foodData.today.totalFats,
  todayFiber: foodData.today.totalFiber,

  addFoodLog: (log) => {
    const newLog: FoodLog = { ...log, id: `meal_${Date.now()}` };
    set((state) => ({
      foodLogs: [...state.foodLogs, newLog],
      todayCalories: state.todayCalories + log.calories,
      todayProtein: state.todayProtein + log.protein,
      todayCarbs: state.todayCarbs + log.carbs,
      todayFats: state.todayFats + log.fats,
      todayFiber: state.todayFiber + log.fiber,
    }));
  },

  removeFoodLog: (id) => {
    const log = get().foodLogs.find((l) => l.id === id);
    if (!log) return;
    set((state) => ({
      foodLogs: state.foodLogs.filter((l) => l.id !== id),
      todayCalories: Math.max(0, state.todayCalories - log.calories),
      todayProtein: Math.max(0, state.todayProtein - log.protein),
      todayCarbs: Math.max(0, state.todayCarbs - log.carbs),
      todayFats: Math.max(0, state.todayFats - log.fats),
    }));
  },

  addWeightLog: (log) => {
    const newLog: WeightLog = { ...log, id: `w_${Date.now()}` };
    set((state) => ({ weightLogs: [newLog, ...state.weightLogs] }));
  },

  addWorkoutLog: (log) => {
    const newLog: WorkoutLog = { ...log, id: `wo_${Date.now()}` };
    set((state) => ({ workoutLogs: [newLog, ...state.workoutLogs] }));
  },

  removeWorkoutLog: (id) => {
    set((state) => ({ workoutLogs: state.workoutLogs.filter((l) => l.id !== id) }));
  },

  addWater: (amount) => {
    const newLog: WaterLog = { id: `water_${Date.now()}`, amount, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) };
    set((state) => ({
      waterLogs: [...state.waterLogs, newLog],
      waterTotal: parseFloat((state.waterTotal + amount).toFixed(2)),
    }));
  },
}));
