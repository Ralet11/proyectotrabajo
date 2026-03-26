import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { loginSchema } from '@oficios/contracts';

import { Screen } from '@/components/Screen';
import { useAuthStore } from '@/features/auth/auth.store';

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginScreen() {
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
      Alert.alert('No se pudo iniciar sesión', error instanceof Error ? error.message : 'Error desconocido');
    }
  });

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Oficios</Text>
        <Text style={styles.subtitle}>Encontrá profesionales y gestioná solicitudes desde una sola app.</Text>
      </View>

      <View style={styles.card}>
        <Controller
          control={form.control}
          name="email"
          render={({ field }) => (
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Email"
              style={styles.input}
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />

        <Controller
          control={form.control}
          name="password"
          render={({ field }) => (
            <TextInput
              secureTextEntry
              placeholder="Password"
              style={styles.input}
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />

        <Pressable style={styles.button} onPress={onSubmit}>
          <Text style={styles.buttonLabel}>Ingresar</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d6d3d1',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fafaf9',
  },
  button: {
    backgroundColor: '#0f766e',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

