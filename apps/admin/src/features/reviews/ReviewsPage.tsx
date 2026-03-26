import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardContent, Stack, Typography } from '@mui/material';

import { adminApi, fetchList } from '../../lib/api';

type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  status: string;
};

export function ReviewsPage() {
  const queryClient = useQueryClient();
  const reviewsQuery = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => fetchList<{ items: ReviewItem[] }>('/admin/reviews'),
  });

  const hideMutation = useMutation({
    mutationFn: (id: string) => adminApi.post(`/admin/reviews/${id}/hide`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={800}>
        Reseñas
      </Typography>

      {reviewsQuery.data?.items.map((review) => (
        <Card key={review.id}>
          <CardContent>
            <Typography fontWeight={700}>Rating: {review.rating}/5</Typography>
            <Typography color="text.secondary">{review.status}</Typography>
            <Typography sx={{ mt: 1 }}>{review.comment ?? 'Sin comentario'}</Typography>
            {review.status !== 'HIDDEN' ? (
              <Button sx={{ mt: 2 }} variant="outlined" onClick={() => hideMutation.mutate(review.id)}>
                Ocultar
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

