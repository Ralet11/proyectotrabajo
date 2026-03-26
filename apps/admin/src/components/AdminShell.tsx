import { PropsWithChildren } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import { useAuthStore } from '../features/auth/auth.store';

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Usuarios', to: '/users' },
  { label: 'Profesionales', to: '/professionals' },
  { label: 'Categorías', to: '/categories' },
  { label: 'Solicitudes', to: '/requests' },
  { label: 'Reseñas', to: '/reviews' },
];

export function AdminShell({ children }: PropsWithChildren) {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" color="inherit" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>
            Oficios Admin
          </Typography>
          <Button variant="outlined" onClick={logout}>
            Salir
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            pt: 10,
          },
        }}
      >
        <List>
          {navItems.map((item) => (
            <ListItemButton
              key={item.to}
              component={RouterLink}
              to={item.to}
              selected={location.pathname === item.to}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, ml: '240px', p: 4, pt: 12 }}>
        {children}
      </Box>
    </Box>
  );
}

