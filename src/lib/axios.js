import axios from 'axios';

const envBase = import.meta.env.VITE_API_URL;
const isDev = import.meta.env.MODE === 'development';

const defaultBase = envBase ?? (isDev ? 'http://localhost:5000/api' : '/api');

if (isDev && !envBase) {

  console.warn(
    '[lib/axios] VITE_API_URL not set — falling back to',
    defaultBase,
    '\nSet VITE_API_URL in .env.development for explicit control.'
  );
}

const api = axios.create({
  baseURL: defaultBase,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (isDev) {
  console.log('[lib/axios] baseURL =', api.defaults.baseURL);
}

if (isDev) {
  api.interceptors.request.use(
    (config) => {
  
      console.log(`➡️ ${config.method?.toUpperCase() || 'REQUEST'} ${config.baseURL ?? ''}${config.url}`);
      return config;
    },
    (error) => {
      console.error('❌ Request Error:', error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      const cfg = error.config || {};
      const resolvedUrl = `${cfg.baseURL ?? ''}${cfg.url ?? ''}`;
      console.error(
        '❌ API Error:',
        error.response?.status,
        resolvedUrl,
        error.message,
        '\nresponse.data:',
        error.response?.data
      );
      return Promise.reject(error);
    }
  );
}

export default api;
