import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';

import { AdminShell } from '../components/AdminShell';
import { LoginPage } from '../features/auth/LoginPage';
import { CategoriesPage } from '../features/categories/CategoriesPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ProfessionalsPage } from '../features/professionals/ProfessionalsPage';
import { ReviewsPage } from '../features/reviews/ReviewsPage';
import { RequestsPage } from '../features/dashboard/RequestsPage';
import { UsersPage } from '../features/users/UsersPage';
import { useAuthStore } from '../features/auth/auth.store';

function ProtectedLayout() {
  const token = useAuthStore((state) => state.accessToken);
  return token ? (
    <AdminShell>
      <Outlet />
    </AdminShell>
  ) : (
    <Navigate to="/login" replace />
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'professionals', element: <ProfessionalsPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'reviews', element: <ReviewsPage /> },
      { path: 'requests', element: <RequestsPage /> },
    ],
  },
]);

