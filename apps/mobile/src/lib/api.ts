import axios from 'axios';

import { useAuthStore } from '@/features/auth/auth.store';

export const mobileApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
});

mobileApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function listCategories() {
  const response = await mobileApi.get('/categories');
  return response.data;
}

export async function listProfessionals(params: Record<string, unknown>) {
  const response = await mobileApi.get('/professionals', { params });
  return response.data;
}

export async function getProfessionalById(id: string) {
  const response = await mobileApi.get(`/professionals/${id}`);
  return response.data;
}

export async function createServiceRequest(payload: Record<string, unknown>) {
  const response = await mobileApi.post('/service-requests', payload);
  return response.data;
}

export async function listMyRequests(params: Record<string, unknown>) {
  const response = await mobileApi.get('/me/service-requests', { params });
  return response.data;
}

export async function getServiceRequestById(id: string) {
  const response = await mobileApi.get(`/service-requests/${id}`);
  return response.data;
}

export async function acceptServiceRequest(id: string) {
  const response = await mobileApi.post(`/service-requests/${id}/accept`);
  return response.data;
}

export async function listServiceRequestMessages(id: string) {
  const response = await mobileApi.get(`/service-requests/${id}/messages`);
  return response.data;
}

export async function postServiceRequestMessage(id: string, payload: { body: string }) {
  const response = await mobileApi.post(`/service-requests/${id}/messages`, payload);
  return response.data;
}

export async function getMyProfessionalProfile() {
  const response = await mobileApi.get('/me/professional-profile');
  return response.data;
}

export async function createOrUpdateProfessionalProfile(payload: Record<string, unknown>) {
  try {
    const response = await mobileApi.patch('/me/professional-profile', payload);
    return response.data;
  } catch {
    const response = await mobileApi.post('/me/professional-profile', payload);
    return response.data;
  }
}

