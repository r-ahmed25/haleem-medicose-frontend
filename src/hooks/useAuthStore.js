import { create } from 'zustand';
import api from '../lib/axios';
import {toast} from 'react-hot-toast'


export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  message: '',
  loading: false,
  error: null,
  checkingAuth: true,

  signup: async (formData) => {
    if (formData.password !== formData.confirmPassword) {
			set({ loading: false });
			return toast.error("Passwords do not match");
		}
    try {
      const res = await api.post('/auth/signup', formData);
      set({
      isAuthenticated: true,
      user: res.data.user, // assuming backend returns { user, message }
      message: res.data.message,
      loading: false,
    });
     toast.success(res.data.message);
    } catch (err) {
     set({
      error: err.response?.data?.message || 'Signup failed',
      loading: false,
    });
          toast.error(err.response?.data?.message || 'Signup failed')

    }
  },

  login: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', formData);
     set({ isAuthenticated: true, user: res.data.user, message: res.data.message, loading: false });
     toast.success(res.data.message);
  }  catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', loading: false });
      toast.error(err.response?.data?.message || 'Login failed');
    }
  },

  logout: async () => {
    set({ loading: true, error: null });

    try {
      const res = await api.post('/auth/logout', {});
      set({ isAuthenticated: false, user: null, message: res.data.message, loading: false });
    } catch (err) {
      set({ message: 'Logout failed' });
    }
  },
  checkAuth: async () => {
		set({ checkingAuth: true });
		try {
			const response = await api.get("/auth/getProfile"); 
			set({ user: response.data, checkingAuth: false, isAuthenticated: true });
		} catch (error) {
			console.log(error.message);
			set({ checkingAuth: false, user: null, isAuthenticated: false });
		}
	},

  clearMessage: () => set({ message: '' }),
}));