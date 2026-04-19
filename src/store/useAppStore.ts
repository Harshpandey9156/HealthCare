// src/store/useAppStore.ts
import { create } from 'zustand';
import { authService, AuthUser, LoginPayload, RegisterPayload } from '../services/authService';
import { foodService } from '../services/foodService';
import { workoutService } from '../services/workoutService';
import { waterService } from '../services/waterService';
import { weightService } from '../services/weightService';
import { userService } from '../services/userService';

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Store interface ──────────────────────────────────────────────────────────
interface AppStore {
  // ── Auth ──
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  user: AuthUser | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;

  // ── Food ──
  foodLogs: FoodLog[];
  calorieTrend: { day: string; calories: number }[];
  isLoadingFood: boolean;
  todayCalories: number;
  todayProtein: number;
  todayCarbs: number;
  todayFats: number;
  todayFiber: number;
  fetchFoodLogs: (date?: string) => Promise<void>;
  addFoodLog: (log: Omit<FoodLog, 'id'>) => Promise<void>;
  removeFoodLog: (id: string) => Promise<void>;

  // ── Weight ──
  weightLogs: WeightLog[];
  isLoadingWeight: boolean;
  fetchWeightLogs: () => Promise<void>;
  addWeightLog: (log: Omit<WeightLog, 'id'>) => Promise<void>;

  // ── Workout ──
  workoutLogs: WorkoutLog[];
  weeklyMinutes: { day: string; minutes: number }[];
  isLoadingWorkout: boolean;
  fetchWorkoutLogs: (date?: string) => Promise<void>;
  addWorkoutLog: (log: Omit<WorkoutLog, 'id'>) => Promise<void>;
  removeWorkoutLog: (id: string) => Promise<void>;

  // ── Water ──
  waterLogs: WaterLog[];
  waterTotal: number;
  waterGoal: number;
  weeklyWater: { day: string; amount: number }[];
  isLoadingWater: boolean;
  fetchWaterLogs: (date?: string) => Promise<void>;
  addWater: (amount: number) => Promise<void>;

  // ── Leaderboard ──
  leaderboard: {
    rank: number; name: string; points: number; streak: number;
    avatar: null; isCurrentUser?: boolean;
  }[];
  fetchProfile: () => Promise<void>;
}

// ─── Helper to normalise MongoDB _id → id ────────────────────────────────────
function normaliseId<T extends { _id?: string; id?: string }>(obj: T): T & { id: string } {
  return { ...obj, id: obj._id || obj.id || String(Date.now()) };
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAppStore = create<AppStore>((set, get) => ({
  // ── Auth initial state ──
  isAuthenticated: false,
  isAuthLoading: false,
  authError: null,
  user: null,

  // ── Food initial state ──
  foodLogs: [],
  calorieTrend: [],
  isLoadingFood: false,
  todayCalories: 0,
  todayProtein: 0,
  todayCarbs: 0,
  todayFats: 0,
  todayFiber: 0,

  // ── Weight initial state ──
  weightLogs: [],
  isLoadingWeight: false,

  // ── Workout initial state ──
  workoutLogs: [],
  weeklyMinutes: [],
  isLoadingWorkout: false,

  // ── Water initial state ──
  waterLogs: [],
  waterTotal: 0,
  waterGoal: 2.5,
  weeklyWater: [],
  isLoadingWater: false,

  // ── Leaderboard ──
  leaderboard: [],

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTH ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  loadUser: async () => {
    set({ isAuthLoading: true });
    try {
      const user = await authService.getMe();
      if (user) {
        set({ isAuthenticated: true, user, isAuthLoading: false });
      } else {
        set({ isAuthenticated: false, user: null, isAuthLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, user: null, isAuthLoading: false });
    }
  },

  login: async (payload) => {
    set({ isAuthLoading: true, authError: null });
    try {
      const { user } = await authService.login(payload);
      set({ isAuthenticated: true, user, isAuthLoading: false });
    } catch (err: any) {
      set({ isAuthLoading: false, authError: err?.response?.data?.message || 'Login failed' });
      throw err;
    }
  },

  register: async (payload) => {
    set({ isAuthLoading: true, authError: null });
    try {
      const { user } = await authService.register(payload);
      set({ isAuthenticated: true, user, isAuthLoading: false });
    } catch (err: any) {
      set({ isAuthLoading: false, authError: err?.response?.data?.message || 'Registration failed' });
      throw err;
    }
  },

  logout: async () => {
    await authService.logout();
    set({
      isAuthenticated: false, user: null,
      foodLogs: [], calorieTrend: [],
      workoutLogs: [], weeklyMinutes: [],
      waterLogs: [], waterTotal: 0,
      weightLogs: [], leaderboard: [],
      todayCalories: 0, todayProtein: 0, todayCarbs: 0, todayFats: 0, todayFiber: 0,
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FOOD ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  fetchFoodLogs: async (date) => {
    set({ isLoadingFood: true });
    try {
      const data = await foodService.getLogs(date);
      set({
        foodLogs: (data.logs || []).map(normaliseId),
        calorieTrend: data.trend || [],
        todayCalories: data.totals?.calories || 0,
        todayProtein: data.totals?.protein || 0,
        todayCarbs: data.totals?.carbs || 0,
        todayFats: data.totals?.fats || 0,
        todayFiber: data.totals?.fiber || 0,
        isLoadingFood: false,
      });
    } catch {
      set({ isLoadingFood: false });
    }
  },

  addFoodLog: async (log) => {
    try {
      const newLog = await foodService.addLog(log);
      const nl = normaliseId(newLog);
      set((state) => ({
        foodLogs: [...state.foodLogs, nl],
        todayCalories: state.todayCalories + nl.calories,
        todayProtein: state.todayProtein + nl.protein,
        todayCarbs: state.todayCarbs + nl.carbs,
        todayFats: state.todayFats + nl.fats,
        todayFiber: state.todayFiber + nl.fiber,
      }));
    } catch (err) {
      throw err;
    }
  },

  removeFoodLog: async (id) => {
    const log = get().foodLogs.find((l) => l.id === id);
    if (!log) return;
    set((state) => ({
      foodLogs: state.foodLogs.filter((l) => l.id !== id),
      todayCalories: Math.max(0, state.todayCalories - log.calories),
      todayProtein: Math.max(0, state.todayProtein - log.protein),
      todayCarbs: Math.max(0, state.todayCarbs - log.carbs),
      todayFats: Math.max(0, state.todayFats - log.fats),
    }));
    try {
      await foodService.removeLog(id);
    } catch {
      // Revert on failure
      set((state) => ({ foodLogs: [...state.foodLogs, log] }));
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEIGHT ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  fetchWeightLogs: async () => {
    set({ isLoadingWeight: true });
    try {
      const logs = await weightService.getLogs();
      set({ weightLogs: (logs || []).map(normaliseId), isLoadingWeight: false });
    } catch {
      set({ isLoadingWeight: false });
    }
  },

  addWeightLog: async (log) => {
    try {
      const newLog = await weightService.addLog(log);
      const nl = normaliseId(newLog);
      set((state) => ({ weightLogs: [nl, ...state.weightLogs] }));
    } catch (err) {
      throw err;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WORKOUT ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  fetchWorkoutLogs: async (date) => {
    set({ isLoadingWorkout: true });
    try {
      const data = await workoutService.getLogs(date);
      set({
        workoutLogs: (data.allLogs || data.logs || []).map(normaliseId),
        weeklyMinutes: data.weeklyMinutes || [],
        isLoadingWorkout: false,
      });
    } catch {
      set({ isLoadingWorkout: false });
    }
  },

  addWorkoutLog: async (log) => {
    try {
      const newLog = await workoutService.addLog(log);
      const nl = normaliseId(newLog);
      set((state) => ({ workoutLogs: [nl, ...state.workoutLogs] }));
    } catch (err) {
      throw err;
    }
  },

  removeWorkoutLog: async (id) => {
    set((state) => ({ workoutLogs: state.workoutLogs.filter((l) => l.id !== id) }));
    try {
      await workoutService.removeLog(id);
    } catch {}
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WATER ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  fetchWaterLogs: async (date) => {
    set({ isLoadingWater: true });
    try {
      const data = await waterService.getLogs(date);
      set({
        waterLogs: (data.logs || []).map(normaliseId),
        waterTotal: data.total || 0,
        waterGoal: data.goal || 2.5,
        weeklyWater: (data.weeklyTrend || []).map((t: any) => ({ day: t.day, amount: t.amount })),
        isLoadingWater: false,
      });
    } catch {
      set({ isLoadingWater: false });
    }
  },

  addWater: async (amount) => {
    try {
      const newLog = await waterService.addLog(amount);
      const nl = normaliseId(newLog);
      set((state) => ({
        waterLogs: [...state.waterLogs, nl],
        waterTotal: parseFloat((state.waterTotal + amount).toFixed(2)),
      }));
    } catch (err) {
      throw err;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROFILE / LEADERBOARD
  // ═══════════════════════════════════════════════════════════════════════════

  fetchProfile: async () => {
    try {
      const data = await userService.getProfile();
      set({
        user: data.user,
        leaderboard: data.leaderboard || [],
      });
    } catch {}
  },
}));
