import { create } from 'zustand';
import api from '../lib/axios';
import {toast} from 'react-hot-toast'
import { Navigate } from 'react-router-dom';

// Removed global variables to prevent conflicts


export const useAuthStore = create((set,get) => ({
  user: null,
  isAuthenticated: false,
  message: '',
  loading: false,
  error: null,
  checkingAuth: true,
  refreshing: false,
  loggingOut: false,
  refreshingToken: false,

  signup: async (formData) => {
    set({ loading: true, error: null, refreshing: false });
    if (formData.password !== formData.confirmPassword) {
    set({ loading: false });
    return toast.error("Passwords do not match");
  }
    try {
      console.log(formData)
      const res = await api.post('/auth/signup', formData);
      set({
      isAuthenticated: true,
      user: res.data.user, // assuming backend returns { user, message }
      message: res.data.message,
      loading: false,
      refreshing: false,
    });
     toast.success(res.data.message);
    } catch (err) {
     set({
      error: err.response?.data?.message || 'Signup failed',
      loading: false,
      refreshing: false,
    });
          toast.error(err.response?.data?.message || 'Signup failed')

    }
  },

  login: async (formData) => {
    set({ loading: true, error: null, refreshing: false });
    try {
      const res = await api.post('/auth/login', formData);
     set({ isAuthenticated: true, user: res?.data.user, message: res?.data.message, loading: false, refreshing: false });
     const state = get();
     toast.success(res.data.message);
  }  catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', loading: false, refreshing: false });
      toast.error(err.response?.data?.message || 'Login failed');
    }
  },

  logout: async () => {
    if (get().loggingOut) return; // Prevent multiple logout calls
    set({ loading: true, error: null, refreshing: false, loggingOut: true });

    try {
      const res = await api.post('/auth/logout', {}, { withCredentials: true });
      set({ isAuthenticated: false, user: null, message: res.data.message, loading: false, refreshing: false, loggingOut: false });
      toast.success(res.data.message || "Logged out successfully");
    } catch (err) {
      console.error("Logout API call failed:", err.response?.status, err.message);
      // Even if the API call fails, clear the local state
      set({ isAuthenticated: false, user: null, loading: false, refreshing: false, loggingOut: false });
      toast.error('Logged out locally. Please log in again if needed.');
    }
  },

  forceLogout: () => {
    if (get().loggingOut) return; 
    set({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
      checkingAuth: false,
      refreshing: false,
      loggingOut: false
    });
    toast.error('Session expired - please login again');
  },
  checkAuth: async () => {
    set({ checkingAuth: true });

    try {
      const response = await api.get("/auth/getProfile");
      set({ user: response.data, checkingAuth: false, isAuthenticated: true, refreshing: false });
    } catch (error) {
      console.log("Auth check failed:", error.response?.status, error.message);
      if (error.response?.status === 401 || error.response?.status >= 400) {
        console.log("Auth error, logging out immediately");
        set({ checkingAuth: false, user: null, isAuthenticated: false, refreshing: false });
      } else {
        console.log("Non-auth error, logging out");
        set({ checkingAuth: false, user: null, isAuthenticated: false, refreshing: false });
      }
    }
  },
 refreshToken: async () => {
   if (get().refreshingToken) return Promise.resolve(); // Prevent multiple refresh attempts
   console.log("Starting token refresh...");
   set({ checkingAuth: true, refreshing: true, refreshingToken: true });

   try {
     const res = await api.get("/auth/refresh-token", { withCredentials: true });
     set({ checkingAuth: false, refreshing: false, refreshingToken: false });
     toast.success("Session refreshed successfully");
     return res;
   } catch (err) {
     console.error("Token refresh failed:", err.response?.status, err.message);

     // If refresh token is also expired (401) or invalid, logout immediately
     if (err.response?.status === 401) {
       set({ user: null, isAuthenticated: false, checkingAuth: false, refreshing: false, refreshingToken: false });
       return Promise.resolve();
     }

     // Handle network errors and timeouts
     if (err.code === 'ECONNABORTED' || err.message.includes('timeout') || !err.response) {
       console.log("Network error during refresh, using force logout");
       set({ user: null, isAuthenticated: false, checkingAuth: false, refreshing: false, refreshingToken: false });
       return Promise.resolve();
     }

     set({ user: null, isAuthenticated: false, checkingAuth: false, refreshing: false, refreshingToken: false });
     throw err;
   }
 },

  clearMessage: () => set({ message: '' }),

  // Reset all auth state
  reset: () => {
    console.log("Resetting auth state");
    set({
      user: null,
      isAuthenticated: false,
      message: '',
      loading: false,
      error: null,
      checkingAuth: false,
      refreshing: false,
      loggingOut: false,
      refreshingToken: false
    });
  },
}));



api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

  

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest._skipRefresh) {
      const skipUrls = ['/auth/logout', '/auth/refresh-token', '/auth/login', '/auth/signup', '/orders/verifypayment', '/orders/createcheckout', '/orders/getkey'];
      if (skipUrls.some(url => originalRequest.url?.includes(url))) {
        originalRequest._skipRefresh = true;
        return Promise.reject(error);
      }

      const state = useAuthStore.getState();
      if (state.loggingOut || state.refreshingToken) {
        return Promise.reject(error); 
      }

      originalRequest._retry = true;

      try {
        const refreshResult = await useAuthStore.getState().refreshToken();

        const newState = useAuthStore.getState();
        if (!newState.isAuthenticated || !newState.user) {
          return Promise.reject(new Error("Refresh token expired"));
        }

        return api(originalRequest);

      } catch (refreshError) {
        toast.error("Token refresh failed → logging out...", refreshError?.message || refreshError);

        try {
          await useAuthStore.getState().logout();
        } catch (logoutError) {
          console.error("Logout failed → forcing logout:", logoutError.message);
          useAuthStore.getState().forceLogout();
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);