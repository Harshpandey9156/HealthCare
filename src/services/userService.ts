// src/services/userService.ts
// ─── MOCK implementation ──────────────────────────────────────────────────────
import userData from '../data/user.json';
import { AuthUser } from './authService';

let mockUser = { ...userData.user } as any;

export const userService = {
  async getProfile() {
    await new Promise((r) => setTimeout(r, 300));
    return {
      user:        mockUser as AuthUser,
      leaderboard: userData.leaderboard,
    };
  },

  async updateProfile(updates: Partial<AuthUser & { theme?: string }>) {
    mockUser = { ...mockUser, ...updates };
    return mockUser as AuthUser;
  },
};
