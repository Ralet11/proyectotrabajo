import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';

import { fetchList } from '../../lib/api';

type Dashboard = {
  users: number;
  professionals: number;
  pendingProfessionals: number;
  requests: number;
  pendingRequests: number;
  reviews: number;
};

const cards: Array<keyof Dashboard> = [
  'users',
  'professionals',
  'pendingProfessionals',
  'requests',
  'pendingRequests',
  'reviews',
];

export function DashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => fetchList<Dashboard>('/admin/dashboard'),
  });

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4" fontWeight={800}>
          Dashboard
        </Typography>
        <Typography color="text.secondary">Visibilidad rápida del estado operativo del MVP.</Typography>
      </div>

      <Grid container spacing={2}>
        {cards.map((key) => (
          <Grid key={key} size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary">{key}</Typography>
                <Typography variant="h4" fontWeight={700}>
                  {dashboardQuery.data?.[key] ?? '-'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

