import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { loginSchema } from '@oficios/contracts';

import { useAuthStore } from './auth.store';

type LoginForm = {
  email: string;
  password: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema.pick({ email: true, password: true })),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setError(null);
      await login(values.email, values.password);
      navigate('/dashboard');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo iniciar sesión');
    }
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background:
          'radial-gradient(circle at top left, rgba(15,118,110,0.18), transparent 40%), linear-gradient(135deg, #fafaf9 0%, #e7e5e4 100%)',
        p: 3,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 440 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Panel interno
              </Typography>
              <Typography color="text.secondary">
                Moderación y operación del MVP de Oficios.
              </Typography>
            </Box>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Password"
                  type="password"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Button variant="contained" size="large" onClick={onSubmit} disabled={form.formState.isSubmitting}>
              Ingresar
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

