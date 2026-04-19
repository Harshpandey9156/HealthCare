// src/services/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ─── Change this to your machine's local IP when testing on a physical device ──
// e.g., 'http://192.168.1.5:5000/api'
export const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Inject JWT token on every request ───────────────────────────────────────
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('healthcare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // SecureStore unavailable (web)
  }
  return config;
});

// ─── Handle auth errors globally ─────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear stored token on unauthorized
      try { await SecureStore.deleteItemAsync('healthcare_token'); } catch {}
    }
    return Promise.reject(error);
  }
);

export default api;
