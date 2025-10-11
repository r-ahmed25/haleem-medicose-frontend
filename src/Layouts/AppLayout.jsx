import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const AppLayout = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? (
    <>
      <NavBar />
      <Outlet />
      <Footer />
    </>
  ) : (
    <Navigate to="/login" />
  );
};

export default AppLayout;