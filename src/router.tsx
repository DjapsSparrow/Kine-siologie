import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuth } from './lib/auth';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Protocols from './pages/Protocols';
import Clients from './pages/Clients';
import Appointments from './pages/Appointments';
import Tools from './pages/Tools';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ErrorPage from './pages/ErrorPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'protocols',
        element: <Protocols />,
      },
      {
        path: 'clients',
        element: <Clients />,
      },
      {
        path: 'appointments',
        element: <Appointments />,
      },
      {
        path: 'tools',
        element: <Tools />,
      },
      {
        path: 'journal',
        element: <Tools />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
]);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;