import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { adminApi } from '../../lib/api';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  userEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userEmail: null,
      async login(email, password) {
        const response = await adminApi.post('/auth/login', {
          email,
          password,
          deviceName: 'admin-web',
        });

        const roles = response.data.user.roles as string[];
        if (!roles.includes('ADMIN')) {
          throw new Error('La cuenta no tiene permisos de administrador');
        }

        set({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          userEmail: response.data.user.email,
        });
      },
      logout() {
        set({
          accessToken: null,
          refreshToken: null,
          userEmail: null,
        });
      },
    }),
    {
      name: 'oficios-admin-auth',
    },
  ),
);

