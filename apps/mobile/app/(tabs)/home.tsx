import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Pill, SectionHeading, SurfaceCard } from '@/components/ui';
import { listCategories, listProfessionals } from '@/lib/api';
import { AppTheme, useAppTheme } from '@/theme';

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
  const theme = useAppTheme();
  const styles = createStyles(theme);
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
      <SectionHeading
        eyebrow="Descubrir"
        title="Buscar profesionales"
        subtitle="Cerrajeros, electricistas, plomeros y mas con una base visual facil de replicar."
      />

      <SurfaceCard style={styles.searchCard}>
        <Text style={styles.searchLabel}>Busqueda</Text>
        <TextInput
          placeholder="Buscar por nombre, categoria o descripcion"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          value={text}
          onChangeText={setText}
        />
      </SurfaceCard>

      <FlatList
        data={categories}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        renderItem={({ item }) => {
          const selected = categoryId === item.id;
          return <Pill label={item.name} selected={selected} onPress={() => setCategoryId(selected ? undefined : item.id)} />;
        }}
      />

      <View style={styles.list}>
        {professionals.map((professional) => (
          <Link key={professional.id} href={`/professionals/${professional.id}`} asChild>
            <Pressable>
              <SurfaceCard style={styles.card}>
                <Text style={styles.cardTitle}>{professional.businessName}</Text>
                <Text style={styles.cardMeta}>
                  {professional.averageRating.toFixed(1)} · {professional.reviewCount} resenas
                </Text>
                <Text style={styles.cardDescription} numberOfLines={3}>
                  {professional.description}
                </Text>
              </SurfaceCard>
            </Pressable>
          </Link>
        ))}
      </View>
    </Screen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    searchCard: {
      gap: theme.spacing.sm,
    },
    searchLabel: {
      color: theme.colors.primaryStrong,
      fontWeight: '800',
      fontSize: theme.typography.caption,
      letterSpacing: 1,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.pill,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: theme.colors.surfaceMuted,
      color: theme.colors.text,
    },
    categories: {
      gap: 10,
      paddingVertical: 18,
    },
    list: {
      gap: 12,
      paddingBottom: 24,
    },
    card: {
      gap: 8,
    },
    cardTitle: {
      fontWeight: '800',
      fontSize: 18,
      color: theme.colors.text,
    },
    cardMeta: {
      color: theme.colors.primaryStrong,
      fontWeight: '600',
    },
    cardDescription: {
      color: theme.colors.textMuted,
      lineHeight: 22,
    },
  });
}
