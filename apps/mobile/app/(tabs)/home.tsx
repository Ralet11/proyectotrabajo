import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { listCategories, listProfessionals } from '@/lib/api';

type CategoryItem = {
  id: string;
  name: string;
};

type ProfessionalItem = {
  id: string;
  businessName: string;
  averageRating: number;
  reviewCount: number;
  description: string;
};

export default function HomeScreen() {
  const [text, setText] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
  });

  const professionalsQuery = useQuery({
    queryKey: ['professionals', categoryId, text],
    queryFn: () => listProfessionals({ categoryId, text }),
  });

  const categories: CategoryItem[] = categoriesQuery.data?.items ?? [];
  const professionals: ProfessionalItem[] = useMemo(
    () => professionalsQuery.data?.items ?? [],
    [professionalsQuery.data],
  );

  return (
    <Screen scroll>
      <Text style={styles.title}>Buscar profesionales</Text>
      <Text style={styles.subtitle}>Cerrajeros, electricistas, plomeros y más.</Text>

      <TextInput
        placeholder="Buscar por nombre, categoría o descripción"
        style={styles.input}
        value={text}
        onChangeText={setText}
      />

      <FlatList
        data={categories}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        renderItem={({ item }) => {
          const selected = categoryId === item.id;
          return (
            <Pressable
              onPress={() => setCategoryId(selected ? undefined : item.id)}
              style={[styles.categoryPill, selected && styles.categoryPillSelected]}
            >
              <Text style={[styles.categoryPillLabel, selected && styles.categoryPillLabelSelected]}>{item.name}</Text>
            </Pressable>
          );
        }}
      />

      <View style={styles.list}>
        {professionals.map((professional) => (
          <Link key={professional.id} href={`/professionals/${professional.id}`} asChild>
            <Pressable style={styles.card}>
              <Text style={styles.cardTitle}>{professional.businessName}</Text>
              <Text style={styles.cardMeta}>
                {professional.averageRating.toFixed(1)} · {professional.reviewCount} reseñas
              </Text>
              <Text style={styles.cardDescription} numberOfLines={3}>
                {professional.description}
              </Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    color: '#4b5563',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d6d3d1',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  categories: {
    gap: 10,
    paddingVertical: 18,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#e7e5e4',
  },
  categoryPillSelected: {
    backgroundColor: '#0f766e',
  },
  categoryPillLabel: {
    color: '#292524',
    fontWeight: '600',
  },
  categoryPillLabelSelected: {
    color: '#ffffff',
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    gap: 8,
  },
  cardTitle: {
    fontWeight: '800',
    fontSize: 18,
    color: '#111827',
  },
  cardMeta: {
    color: '#0f766e',
    fontWeight: '600',
  },
  cardDescription: {
    color: '#4b5563',
    lineHeight: 22,
  },
});
