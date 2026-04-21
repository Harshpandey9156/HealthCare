// src/services/api.ts
// ─── Axios instance (for future real-API integration) ─────────────────────────
// All services currently use mock data. When ready to connect to the backend,
// swap out the mock implementations and let services call this axios instance.

import axios from 'axios';
import * as Keychain from 'react-native-keychain';

export const API_BASE_URL = 'http://10.0.2.2:8000/api'; // FastAPI on Android emulator

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

const TOKEN_SERVICE = 'healthcare_rn';

// ─── Token helpers ────────────────────────────────────────────────────────────
export async function saveToken(token: string): Promise<void> {
  await Keychain.setGenericPassword('token', token, { service: TOKEN_SERVICE });
}

export async function getToken(): Promise<string | null> {
  try {
    const creds = await Keychain.getGenericPassword({ service: TOKEN_SERVICE });
    return creds ? creds.password : null;
  } catch {
    return null;
  }
}

export async function clearToken(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: TOKEN_SERVICE });
  } catch {}
}

// ─── Inject JWT token on every request ───────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Handle auth errors globally ─────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearToken();
    }
    return Promise.reject(error);
  }
);

export default api;
