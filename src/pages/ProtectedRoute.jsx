// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;