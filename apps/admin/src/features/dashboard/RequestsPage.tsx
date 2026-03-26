import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Stack, Typography } from '@mui/material';

import { fetchList } from '../../lib/api';

type RequestItem = {
  id: string;
  status: string;
  message: string;
  professional: { businessName: string };
  category: { name: string };
};

export function RequestsPage() {
  const requestsQuery = useQuery({
    queryKey: ['admin-requests'],
    queryFn: () => fetchList<{ items: RequestItem[] }>('/admin/service-requests'),
  });

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={800}>
        Solicitudes
      </Typography>

      {requestsQuery.data?.items.map((request) => (
        <Card key={request.id}>
          <CardContent>
            <Typography fontWeight={700}>
              {request.category.name} · {request.professional.businessName}
            </Typography>
            <Typography color="text.secondary">{request.status}</Typography>
            <Typography sx={{ mt: 1 }}>{request.message}</Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

