import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import ProductDetails from './pages/ProductDetails';
import SearchResults from './pages/SearchResults';
import ChooseLocation from './pages/ChooseLocation';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import AppLayout from './Layouts/AppLayout';
import AuthLayout from './Layouts/AuthLayout';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './hooks/useAuthStore';
import NavBar from './components/NavBar';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { isAuthenticated, user, checkingAuth, checkAuth } = useAuthStore();
  console.log(user);
  useEffect (() => {
   checkAuth();
  }, [checkAuth])

  if(checkingAuth) return <LoadingSpinner />
  return (

    <>
    <Routes>
      {/* Auth-only routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage /> } />
        <Route path="/signup" element={ <SignUpPage />} />
      </Route>

      {/* Protected app routes */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/location" element={<ChooseLocation />} />
      </Route>
    </Routes>
    <Toaster />
    </>
  );
}

export default App;