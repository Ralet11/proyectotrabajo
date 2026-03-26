import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { useAuthStore } from '@/features/auth/auth.store';

export default function ProfileScreen() {
  const userEmail = useAuthStore((state) => state.userEmail);
  const logout = useAuthStore((state) => state.logout);

  return (
    <Screen>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.subtitle}>{userEmail}</Text>

      <Link href="/profile/professional" asChild>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonLabel}>Configurar perfil profesional</Text>
        </Pressable>
      </Link>

      <Pressable style={styles.secondaryButton} onPress={logout}>
        <Text style={styles.secondaryButtonLabel}>Cerrar sesión</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    color: '#4b5563',
  },
  primaryButton: {
    backgroundColor: '#0f766e',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonLabel: {
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d6d3d1',
  },
  secondaryButtonLabel: {
    color: '#292524',
    fontWeight: '700',
  },
});

