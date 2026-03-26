import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/Screen';
import {
  acceptServiceRequest,
  getServiceRequestById,
  listServiceRequestMessages,
  postServiceRequestMessage,
} from '@/lib/api';

type RequestDetail = {
  id: string;
  status: string;
  message: string;
  professional?: {
    phone?: string | null;
    whatsappNumber?: string | null;
  };
};

type MessageItem = {
  id: string;
  body: string;
};

export default function ServiceRequestDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');

  const requestQuery = useQuery({
    queryKey: ['service-request', params.id],
    queryFn: () => getServiceRequestById(params.id),
    enabled: !!params.id,
  });

  const messagesQuery = useQuery({
    queryKey: ['service-request-messages', params.id],
    queryFn: () => listServiceRequestMessages(params.id),
    enabled: !!params.id,
  });

  const messageMutation = useMutation({
    mutationFn: (body: string) => postServiceRequestMessage(params.id, { body }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['service-request-messages', params.id] });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: () => acceptServiceRequest(params.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-request', params.id] });
    },
  });

  const request = requestQuery.data as RequestDetail | undefined;

  if (!request) {
    return (
      <Screen>
        <Text>Cargando...</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>{request.status}</Text>
      <Text style={styles.subtitle}>{request.message}</Text>

      {request.professional?.phone || request.professional?.whatsappNumber ? (
        <View style={styles.contactBox}>
          <Text style={styles.contactTitle}>Contacto desbloqueado</Text>
          <Text>Teléfono: {request.professional.phone ?? 'N/D'}</Text>
          <Text>WhatsApp: {request.professional.whatsappNumber ?? 'N/D'}</Text>
        </View>
      ) : null}

      {request.status === 'PENDING' ? (
        <Pressable
          style={styles.secondaryButton}
          onPress={async () => {
            try {
              await acceptMutation.mutateAsync();
            } catch (error) {
              Alert.alert('No se pudo aceptar', error instanceof Error ? error.message : 'Error desconocido');
            }
          }}
        >
          <Text style={styles.secondaryButtonLabel}>Aceptar como profesional (demo)</Text>
        </Pressable>
      ) : null}

      <View style={styles.messagesList}>
        {(messagesQuery.data as MessageItem[] | undefined)?.map((entry) => (
          <View key={entry.id} style={styles.messageBubble}>
            <Text style={styles.messageBody}>{entry.body}</Text>
          </View>
        ))}
      </View>

      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Escribí un mensaje"
        style={styles.input}
      />
      <Pressable
        style={styles.button}
        onPress={async () => {
          try {
            await messageMutation.mutateAsync(message);
          } catch (error) {
            Alert.alert('No se pudo enviar el mensaje', error instanceof Error ? error.message : 'Error desconocido');
          }
        }}
      >
        <Text style={styles.buttonLabel}>Enviar mensaje</Text>
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
    marginTop: 10,
    color: '#4b5563',
  },
  contactBox: {
    marginTop: 18,
    backgroundColor: '#ecfccb',
    borderRadius: 18,
    padding: 16,
    gap: 4,
  },
  contactTitle: {
    fontWeight: '800',
    color: '#365314',
  },
  secondaryButton: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#b45309',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonLabel: {
    color: '#b45309',
    fontWeight: '700',
  },
  messagesList: {
    marginTop: 20,
    gap: 10,
  },
  messageBubble: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
  },
  messageBody: {
    color: '#111827',
  },
  input: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#d6d3d1',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  button: {
    marginTop: 14,
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
