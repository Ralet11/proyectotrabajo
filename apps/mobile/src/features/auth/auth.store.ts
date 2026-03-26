import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { mobileApi } from '@/lib/api';

const ACCESS_TOKEN_KEY = 'oficios.accessToken';
const REFRESH_TOKEN_KEY = 'oficios.refreshToken';
const USER_EMAIL_KEY = 'oficios.userEmail';

type AuthState = {
  hydrated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  userEmail: string | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  hydrated: false,
  accessToken: null,
  refreshToken: null,
  userEmail: null,
  async bootstrap() {
    const [accessToken, refreshToken, userEmail] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.getItemAsync(USER_EMAIL_KEY),
    ]);

    set({
      accessToken,
      refreshToken,
      userEmail,
      hydrated: true,
    });
  },
  async login(email, password) {
    const response = await mobileApi.post('/auth/login', {
      email,
      password,
      deviceName: 'mobile-app',
    });

    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, response.data.accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.data.refreshToken),
      SecureStore.setItemAsync(USER_EMAIL_KEY, response.data.user.email),
    ]);

    set({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      userEmail: response.data.user.email,
      hydrated: true,
    });
  },
  async logout() {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_EMAIL_KEY),
    ]);

    set({
      accessToken: null,
      refreshToken: null,
      userEmail: null,
      hydrated: true,
    });
  },
}));

