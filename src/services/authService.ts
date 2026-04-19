// src/services/authService.ts
import api from './api';
import * as SecureStore from 'expo-secure-store';

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
    food: { current: number; longest: number };
    workout: { current: number; longest: number };
    water: { current: number; longest: number };
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

const TOKEN_KEY = 'healthcare_token';

export const authService = {
  async login(payload: LoginPayload): Promise<{ token: string; user: AuthUser }> {
    const { data } = await api.post('/auth/login', payload);
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    return data;
  },

  async register(payload: RegisterPayload): Promise<{ token: string; user: AuthUser }> {
    const { data } = await api.post('/auth/register', payload);
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    return data;
  },

  async getMe(): Promise<AuthUser | null> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) return null;
      const { data } = await api.get('/auth/me');
      return data.user;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
};
