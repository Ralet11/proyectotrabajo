import { Redirect } from 'expo-router';

import { useAuthStore } from '@/features/auth/auth.store';

export default function IndexScreen() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!hydrated) {
    return null;
  }

  return <Redirect href={accessToken ? '/(tabs)/home' : '/(auth)/login'} />;
}

