import { Tabs } from 'expo-router';

import { useAppTheme } from '@/theme';

export default function TabsLayout() {
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitleStyle: {
          color: theme.colors.text,
          fontWeight: '800',
        },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 70,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Buscar' }} />
      <Tabs.Screen name="requests" options={{ title: 'Solicitudes' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
