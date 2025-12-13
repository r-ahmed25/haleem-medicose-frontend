import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuthStore";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const AppLayout = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  ) : (
    <Navigate to="/login" />
  );
};

export default AppLayout;
