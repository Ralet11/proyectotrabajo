import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        tabBarActiveTintColor: '#0f766e',
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Buscar' }} />
      <Tabs.Screen name="requests" options={{ title: 'Solicitudes' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

