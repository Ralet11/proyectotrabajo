import { useQuery } from '@tanstack/react-query';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { getProfessionalById } from '@/lib/api';

type ServiceArea = {
  id: string;
  label: string;
  radiusKm: number;
};

type ProfessionalDetail = {
  id: string;
  businessName: string;
  averageRating: number;
  reviewCount: number;
  description: string;
  categoryIds: string[];
  serviceAreas: ServiceArea[];
};

export default function ProfessionalDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const professionalQuery = useQuery({
    queryKey: ['professional', params.id],
    queryFn: () => getProfessionalById(params.id),
    enabled: !!params.id,
  });

  const professional = professionalQuery.data as ProfessionalDetail | undefined;
  const firstCategoryId = professional?.categoryIds[0];

  if (!professional) {
    return (
      <Screen>
        <Text>Cargando...</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>{professional.businessName}</Text>
      <Text style={styles.meta}>
        {professional.averageRating.toFixed(1)} · {professional.reviewCount} reseñas
      </Text>
      <Text style={styles.description}>{professional.description}</Text>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Cobertura</Text>
        {professional.serviceAreas.map((area) => (
          <Text key={area.id} style={styles.area}>
            {area.label} · {area.radiusKm} km
          </Text>
        ))}
      </View>

      {firstCategoryId ? (
        <Link
          href={{
            pathname: '/requests/new',
            params: { professionalId: professional.id, categoryId: firstCategoryId },
          }}
          asChild
        >
          <Pressable style={styles.button}>
            <Text style={styles.buttonLabel}>Solicitar trabajo</Text>
          </Pressable>
        </Link>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
  },
  meta: {
    marginTop: 10,
    color: '#0f766e',
    fontWeight: '700',
  },
  description: {
    marginTop: 16,
    color: '#374151',
    lineHeight: 24,
  },
  block: {
    marginTop: 24,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
  },
  blockTitle: {
    fontWeight: '800',
    marginBottom: 10,
  },
  area: {
    color: '#4b5563',
    marginBottom: 6,
  },
  button: {
    marginTop: 24,
    backgroundColor: '#b45309',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
