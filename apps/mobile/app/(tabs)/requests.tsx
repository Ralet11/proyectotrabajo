import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { listMyRequests } from '@/lib/api';

type RequestItem = {
  id: string;
  status: string;
  message: string;
};

export default function RequestsScreen() {
  const requestsQuery = useQuery({
    queryKey: ['my-requests'],
    queryFn: () => listMyRequests({ as: 'customer' }),
  });

  return (
    <Screen scroll>
      <Text style={styles.title}>Mis solicitudes</Text>

      {(requestsQuery.data?.items as RequestItem[] | undefined)?.map((request) => (
        <Link key={request.id} href={`/requests/${request.id}`} asChild>
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>{request.status}</Text>
            <Text style={styles.cardBody}>{request.message}</Text>
          </Pressable>
        </Link>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  cardBody: {
    color: '#4b5563',
  },
});
