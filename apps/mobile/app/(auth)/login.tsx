import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@oficios/contracts';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { AppButton, AppTextField, SurfaceCard, ThemePicker } from '@/components/ui';
import { useAuthStore } from '@/features/auth/auth.store';
import { AppTheme, useAppTheme, useThemeController } from '@/theme';
import { paletteLabels } from '@/theme/palettes';

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { paletteName, setPaletteName } = useThemeController();
  const [themePickerVisible, setThemePickerVisible] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema.pick({ email: true, password: true })),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login(values.email, values.password);
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('No se pudo iniciar sesion', error instanceof Error ? error.message : 'Error desconocido');
    }
  });

  return (
    <Screen>
      <ThemePicker
        visible={themePickerVisible}
        activePalette={paletteName}
        onClose={() => setThemePickerVisible(false)}
        onSelect={setPaletteName}
      />

      <View style={styles.hero}>
        <Pressable style={styles.badge} onPress={() => setThemePickerVisible(true)}>
          <Text style={styles.badgeLabel}>Tema: {paletteLabels[paletteName].title}</Text>
          <Text style={styles.badgeHint}>Tocar para cambiar</Text>
        </Pressable>
        <Text style={styles.title}>Oficios</Text>
        <Text style={styles.subtitle}>
          Conecta clientes y profesionales con una interfaz clara, luminosa y facil de escalar.
        </Text>
      </View>

      <SurfaceCard style={styles.card}>
        <Text style={styles.cardEyebrow}>LOGIN</Text>
        <Text style={styles.cardTitle}>Ingresa para continuar</Text>

        <Controller
          control={form.control}
          name="email"
          render={({ field }) => (
            <AppTextField
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="nombre@correo.com"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />

        <Controller
          control={form.control}
          name="password"
          render={({ field }) => (
            <AppTextField
              label="Contrasena"
              secureTextEntry
              placeholder="Ingresa tu contrasena"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />

        <AppButton label="Ingresar" onPress={onSubmit} />
      </SurfaceCard>
    </Screen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    hero: {
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xxl,
      marginBottom: theme.spacing.lg,
    },
    badge: {
      alignSelf: 'flex-start',
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceAlt,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 2,
    },
    badgeLabel: {
      color: theme.colors.primaryStrong,
      fontWeight: '800',
      fontSize: theme.typography.caption,
    },
    badgeHint: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: '700',
    },
    title: {
      fontSize: theme.typography.hero,
      fontWeight: '800',
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: theme.typography.body,
      lineHeight: 24,
      color: theme.colors.textMuted,
    },
    card: {
      gap: theme.spacing.md,
    },
    cardEyebrow: {
      color: theme.colors.primaryStrong,
      fontSize: theme.typography.caption,
      fontWeight: '800',
      letterSpacing: 1.2,
    },
    cardTitle: {
      color: theme.colors.text,
      fontSize: theme.typography.heading,
      fontWeight: '800',
    },
  });
}
