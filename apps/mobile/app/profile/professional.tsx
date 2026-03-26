import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { upsertProfessionalProfileSchema } from '@oficios/contracts';

import { createOrUpdateProfessionalProfile, getMyProfessionalProfile } from '@/lib/api';

type ProfessionalForm = {
  businessName: string;
  description: string;
  phone?: string;
  whatsappNumber?: string;
};

export default function ProfessionalProfileScreen() {
  const profileQuery = useQuery({
    queryKey: ['my-professional-profile'],
    queryFn: getMyProfessionalProfile,
    retry: false,
  });

  const form = useForm<ProfessionalForm>({
    resolver: zodResolver(
      upsertProfessionalProfileSchema.pick({
        businessName: true,
        description: true,
        phone: true,
        whatsappNumber: true,
      }),
    ),
    values: {
      businessName: profileQuery.data?.businessName ?? '',
      description: profileQuery.data?.description ?? '',
      phone: profileQuery.data?.phone ?? '',
      whatsappNumber: profileQuery.data?.whatsappNumber ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ProfessionalForm) =>
      createOrUpdateProfessionalProfile({
        ...values,
        galleryImageUrls: [],
        availability: {
          isAcceptingRequests: true,
          availableToday: false,
          summary: 'Coordinar por mensaje',
        },
        preferredContactChannel: 'WHATSAPP',
      }),
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Perfil profesional</Text>
      <Text style={styles.subtitle}>Alta y edición básica del perfil del oficio.</Text>

      <Controller
        control={form.control}
        name="businessName"
        render={({ field }) => (
          <TextInput
            style={styles.input}
            placeholder="Nombre comercial"
            value={field.value}
            onChangeText={field.onChange}
          />
        )}
      />
      <Controller
        control={form.control}
        name="description"
        render={({ field }) => (
          <TextInput
            multiline
            style={[styles.input, styles.textarea]}
            placeholder="Descripción del servicio"
            value={field.value}
            onChangeText={field.onChange}
          />
        )}
      />
      <Controller
        control={form.control}
        name="phone"
        render={({ field }) => (
          <TextInput style={styles.input} placeholder="Teléfono" value={field.value} onChangeText={field.onChange} />
        )}
      />
      <Controller
        control={form.control}
        name="whatsappNumber"
        render={({ field }) => (
          <TextInput style={styles.input} placeholder="WhatsApp" value={field.value} onChangeText={field.onChange} />
        )}
      />

      <Pressable
        style={styles.button}
        onPress={form.handleSubmit(async (values) => {
          try {
            await mutation.mutateAsync(values);
            Alert.alert('Perfil guardado', 'La información del perfil profesional fue actualizada.');
          } catch (error) {
            Alert.alert('No se pudo guardar', error instanceof Error ? error.message : 'Error desconocido');
          }
        })}
      >
        <Text style={styles.buttonLabel}>Guardar perfil</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 14,
    backgroundColor: '#f5f5f4',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    marginBottom: 8,
    color: '#4b5563',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textarea: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 8,
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

