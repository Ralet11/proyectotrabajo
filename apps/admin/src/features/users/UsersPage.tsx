import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';

import { fetchList } from '../../lib/api';

type UserItem = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
};

export function UsersPage() {
  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => fetchList<{ items: UserItem[] }>('/admin/users'),
  });

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={800}>
        Usuarios
      </Typography>

      {usersQuery.data?.items.map((user) => (
        <Card key={user.id}>
          <CardContent>
            <Typography fontWeight={700}>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography color="text.secondary">{user.email}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {user.roles.map((role) => (
                <Chip key={role} label={role} />
              ))}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

