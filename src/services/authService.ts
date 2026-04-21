// src/services/authService.ts
// ─── MOCK implementation (replace method bodies with real API calls later) ────
import { saveToken, getToken, clearToken } from './api';
import userData from '../data/user.json';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  targetWeight: number;
  calorieGoal: number;
  waterGoal: number;
  activityLevel: string;
  isPremium: boolean;
  points: number;
  referralCode: string;
  theme: 'dark' | 'light' | 'system';
  streaks: {
    overall: { current: number; longest: number };
    food:    { current: number; longest: number };
    workout: { current: number; longest: number };
    water:   { current: number; longest: number };
  };
  badges: { id: string; label: string; emoji: string; earned: boolean }[];
  joinedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  targetWeight?: number;
  calorieGoal?: number;
  waterGoal?: number;
  activityLevel?: string;
}

const MOCK_TOKEN = 'mock_jwt_token_vitaltrack_dev';

export const authService = {
  async login(payload: LoginPayload): Promise<{ token: string; user: AuthUser }> {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    const { user } = userData;

    // Accept any email/password in dev; enforce mock creds
    if (
      payload.email.toLowerCase().trim() !== user.email &&
      payload.email.toLowerCase().trim() !== 'test@test.com'
    ) {
      throw { response: { data: { message: 'Invalid credentials. Use alex@example.com / password123' } } };
    }

    await saveToken(MOCK_TOKEN);
    return { token: MOCK_TOKEN, user: user as unknown as AuthUser };
  },

  async register(payload: RegisterPayload): Promise<{ token: string; user: AuthUser }> {
    await new Promise((r) => setTimeout(r, 800));

    const newUser: AuthUser = {
      id: `user_${Date.now()}`,
      name: payload.name,
      email: payload.email,
      age: payload.age || 25,
      gender: payload.gender || 'other',
      height: payload.height || 170,
      weight: payload.weight || 70,
      targetWeight: payload.targetWeight || 65,
      calorieGoal: payload.calorieGoal || 2000,
      waterGoal: payload.waterGoal || 2.5,
      activityLevel: payload.activityLevel || 'moderate',
      isPremium: false,
      points: 0,
      referralCode: `${payload.name.toUpperCase().slice(0, 4)}${Date.now().toString().slice(-4)}`,
      theme: 'dark',
      joinedAt: new Date().toISOString(),
      streaks: {
        overall: { current: 0, longest: 0 },
        food:    { current: 0, longest: 0 },
        workout: { current: 0, longest: 0 },
        water:   { current: 0, longest: 0 },
      },
      badges: [
        { id: 'badge_001', label: 'First Log',    emoji: '🥇', earned: false },
        { id: 'badge_002', label: 'Week Streak',  emoji: '🔥', earned: false },
        { id: 'badge_003', label: 'Hydrated',     emoji: '💧', earned: false },
        { id: 'badge_004', label: 'Iron Will',    emoji: '💪', earned: false },
        { id: 'badge_005', label: 'Month Strong', emoji: '🏅', earned: false },
        { id: 'badge_006', label: 'Champion',     emoji: '🏆', earned: false },
      ],
    };

    await saveToken(MOCK_TOKEN);
    return { token: MOCK_TOKEN, user: newUser };
  },

  async getMe(): Promise<AuthUser | null> {
    try {
      const token = await getToken();
      if (!token) return null;
      await new Promise((r) => setTimeout(r, 400));
      return userData.user as unknown as AuthUser;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    await clearToken();
  },

  async getToken(): Promise<string | null> {
    return getToken();
  },
};
