import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';

import { adminApi, fetchList } from '../../lib/api';

type ProfessionalItem = {
  id: string;
  businessName: string;
  status: string;
  categoryIds: string[];
  user: { email: string; firstName: string; lastName: string };
};

export function ProfessionalsPage() {
  const queryClient = useQueryClient();
  const professionalsQuery = useQuery({
    queryKey: ['admin-professionals'],
    queryFn: () => fetchList<{ items: ProfessionalItem[] }>('/admin/professionals'),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.post(`/admin/professionals/${id}/approve`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-professionals'] }),
  });

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={800}>
        Profesionales
      </Typography>

      {professionalsQuery.data?.items.map((professional) => (
        <Card key={professional.id}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <div>
                <Typography fontWeight={700}>{professional.businessName}</Typography>
                <Typography color="text.secondary">{professional.user.email}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip label={professional.status} color={professional.status === 'APPROVED' ? 'success' : 'default'} />
                  <Chip label={`${professional.categoryIds.length} categorías`} variant="outlined" />
                </Stack>
              </div>

              {professional.status !== 'APPROVED' ? (
                <Button variant="contained" onClick={() => approveMutation.mutate(professional.id)}>
                  Aprobar
                </Button>
              ) : null}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

