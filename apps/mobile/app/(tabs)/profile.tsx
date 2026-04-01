import { Link } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { AppButton, SectionHeading, SurfaceCard } from '@/components/ui';
import { useAuthStore } from '@/features/auth/auth.store';
import { AppTheme, useAppTheme } from '@/theme';

export default function ProfileScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const userEmail = useAuthStore((state) => state.userEmail);
  const logout = useAuthStore((state) => state.logout);

  return (
    <Screen>
      <SectionHeading eyebrow="Cuenta" title="Perfil" subtitle={userEmail} />

      <SurfaceCard>
        <Text style={styles.cardTitle}>Configuracion</Text>
        <Text style={styles.cardBody}>
          Define tu presentacion profesional, datos de contacto y disponibilidad usando los mismos tokens de diseno.
        </Text>

        <Link href="/profile/professional" asChild>
          <AppButton label="Configurar perfil profesional" />
        </Link>

        <AppButton label="Cerrar sesion" variant="secondary" onPress={logout} />
      </SurfaceCard>
    </Screen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    cardTitle: {
      color: theme.colors.text,
      fontWeight: '800',
      fontSize: theme.typography.heading,
    },
    cardBody: {
      color: theme.colors.textMuted,
      lineHeight: 22,
    },
  });
}
