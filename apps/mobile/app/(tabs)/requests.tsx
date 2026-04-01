import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { SectionHeading, SurfaceCard } from '@/components/ui';
import { listMyRequests } from '@/lib/api';
import { AppTheme, useAppTheme } from '@/theme';

type RequestItem = {
  id: string;
  status: string;
  message: string;
};

export default function RequestsScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const requestsQuery = useQuery({
    queryKey: ['my-requests'],
    queryFn: () => listMyRequests({ as: 'customer' }),
  });

  return (
    <Screen scroll>
      <SectionHeading
        eyebrow="Seguimiento"
        title="Mis solicitudes"
        subtitle="Unifica estado, mensaje inicial y acceso al detalle con la misma base visual."
      />

      {(requestsQuery.data?.items as RequestItem[] | undefined)?.map((request) => (
        <Link key={request.id} href={`/requests/${request.id}`} asChild>
          <Pressable>
            <SurfaceCard style={styles.card}>
              <Text style={styles.cardStatus}>{request.status}</Text>
              <Text style={styles.cardBody}>{request.message}</Text>
            </SurfaceCard>
          </Pressable>
        </Link>
      ))}
    </Screen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      marginBottom: 12,
    },
    cardStatus: {
      fontWeight: '700',
      marginBottom: 8,
      color: theme.colors.primaryStrong,
    },
    cardBody: {
      color: theme.colors.textMuted,
    },
  });
}
