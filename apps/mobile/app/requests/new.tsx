import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { createServiceRequestSchema } from '@oficios/contracts';

import { Screen } from '@/components/Screen';
import { createServiceRequest } from '@/lib/api';

type RequestForm = {
  message: string;
};

export default function NewRequestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ professionalId: string; categoryId: string }>();
  const mutation = useMutation({
    mutationFn: (message: string) =>
      createServiceRequest({
        professionalId: params.professionalId,
        categoryId: params.categoryId,
        message,
        preferredContactChannel: 'WHATSAPP',
      }),
    onSuccess: (data) => {
      router.replace(`/requests/${data.id}`);
    },
  });

  const form = useForm<RequestForm>({
    resolver: zodResolver(createServiceRequestSchema.pick({ message: true })),
    defaultValues: {
      message: '',
    },
  });

  return (
    <Screen>
      <Text style={styles.title}>Nueva solicitud</Text>
      <Text style={styles.subtitle}>Explicá brevemente qué necesitás y cómo contactarte.</Text>

      <Controller
        control={form.control}
        name="message"
        render={({ field }) => (
          <TextInput
            multiline
            style={styles.textarea}
            placeholder="Necesito cambiar una cerradura de puerta principal..."
            value={field.value}
            onChangeText={field.onChange}
          />
        )}
      />

      <Pressable
        style={styles.button}
        onPress={form.handleSubmit(async (values) => {
          try {
            await mutation.mutateAsync(values.message);
          } catch (error) {
            Alert.alert('No se pudo crear la solicitud', error instanceof Error ? error.message : 'Error desconocido');
          }
        })}
      >
        <Text style={styles.buttonLabel}>Enviar solicitud</Text>
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
    marginBottom: 18,
    color: '#4b5563',
  },
  textarea: {
    minHeight: 160,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 18,
    backgroundColor: '#0f766e',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#ffffff',
    fontWeight: '700',
  },
});

