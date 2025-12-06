import axios from "axios";

const hasNavigator = typeof navigator !== "undefined";

/**
 * HYBRID LOGIC (simple + bulletproof):
 *
 * 1. In PRODUCTION → Always use Render URL
 * 2. In DEV → Use VITE_API_URL or localhost
 * 3. Capacitor & WebView → No special logic needed if URL is correct
 */

const API_URL = import.meta.env.PROD
  ? "https://haleem-medicose-backend.onrender.com/api"
  : import.meta.env.VITE_API_URL || "http://localhost:5000/api";

console.log("🌍 MODE:", import.meta.env.MODE);
console.log("🔗 API:", API_URL);

/** Optional token getter */
function getStoredToken() {
  try {
    return localStorage.getItem("accessToken");
  } catch (e) {
    return null;
  }
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===============================
   REQUEST LOGGER + AUTH HEADER
================================= */
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `➡️ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    );

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

/* ===============================
   RESPONSE LOGGER
================================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const cfg = error.config || {};
    const finalUrl = `${cfg.baseURL}${cfg.url}`;

    console.error("❌ API ERROR", {
      url: finalUrl,
      method: cfg.method?.toUpperCase(),
      message: error.message,
      code: error.code,
      status: error.response?.status,
      online: hasNavigator ? navigator.onLine : "unknown",
    });

    // Extra info on mobile networks
    if (hasNavigator && navigator.connection) {
      console.log("📶 Network:", {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
