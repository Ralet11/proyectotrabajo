import axios from 'axios';

import { useAuthStore } from '../features/auth/auth.store';

export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

adminApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function fetchList<T>(path: string, params?: Record<string, unknown>) {
  const response = await adminApi.get<T>(path, { params });
  return response.data;
}

