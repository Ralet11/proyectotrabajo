import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { upsertCategorySchema } from '@oficios/contracts';

import { adminApi, fetchList } from '../../lib/api';

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type CategoryForm = {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
};

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchList<{ items: CategoryItem[] }>('/categories'),
  });

  const form = useForm<CategoryForm>({
    resolver: zodResolver(upsertCategorySchema),
    defaultValues: {
      slug: '',
      name: '',
      description: '',
      icon: '',
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: CategoryForm) => adminApi.post('/admin/categories', values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      form.reset();
    },
  });

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={800}>
        Categorías
      </Typography>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography fontWeight={700}>Nueva categoría</Typography>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <TextField {...field} label="Nombre" error={!!fieldState.error} helperText={fieldState.error?.message} />
              )}
            />
            <Controller
              control={form.control}
              name="slug"
              render={({ field, fieldState }) => (
                <TextField {...field} label="Slug" error={!!fieldState.error} helperText={fieldState.error?.message} />
              )}
            />
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Descripción"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Button variant="contained" onClick={form.handleSubmit((values) => createMutation.mutate(values))}>
              Crear categoría
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {categoriesQuery.data?.items.map((category) => (
        <Card key={category.id}>
          <CardContent>
            <Typography fontWeight={700}>{category.name}</Typography>
            <Typography color="text.secondary">{category.slug}</Typography>
            <Typography sx={{ mt: 1 }}>{category.description}</Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

