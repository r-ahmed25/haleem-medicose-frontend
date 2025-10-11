import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';

const AuthLayout = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/" /> : <Outlet />;
};

export default AuthLayout;