import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth/auth.store';
import { ThemeProvider } from '@/theme';

const queryClient = new QueryClient();

export default function RootLayout() {
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShadowVisible: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="professionals/[id]" options={{ title: 'Profesional' }} />
          <Stack.Screen name="requests/new" options={{ title: 'Nueva solicitud' }} />
          <Stack.Screen name="requests/[id]" options={{ title: 'Solicitud' }} />
          <Stack.Screen name="profile/professional" options={{ title: 'Perfil profesional' }} />
        </Stack>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

