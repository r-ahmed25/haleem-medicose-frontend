import axios from "axios";

const hasNavigator = typeof navigator !== "undefined";
const userAgent = hasNavigator ? navigator.userAgent : "";
const isAndroidWebView = /Android/i.test(userAgent);
const hasWindow = typeof window !== "undefined";
function getStoredToken() {
  // You can change this to SecureStorage later
  try {
    return localStorage.getItem("accessToken");
  } catch (e) {
    return null;
  }
}

const isCapacitor = hasWindow && Boolean(window.Capacitor);

const envBase = import.meta.env.VITE_API_URL;
const androidDeviceBase = import.meta.env.VITE_ANDROID_DEVICE_API_URL;
const androidEmulatorBase =
  import.meta.env.VITE_ANDROID_EMULATOR_API_URL ||
  "https://10.0.2.2:5000/api";
const isDev = import.meta.env.MODE === "development";
const fallbackDevBase = "https://localhost:5000/api";

function resolveAndroidBase() {
  return androidDeviceBase || androidEmulatorBase || envBase || fallbackDevBase;
}

function getBaseURL() {
  // Highest priority: explicit VITE_API_URL
  if (envBase) return envBase;

  // Capacitor / Android app / emulator
  if (isCapacitor || isAndroidWebView) {
    return resolveAndroidBase();
  }

  // Browser development fallback
  if (isDev) {
    return fallbackDevBase;
  }

  // Production (same-origin)
  return "/api";
}

const runtimeBaseURL = getBaseURL();
const shouldLogMobileContext = isAndroidWebView || isCapacitor;
const shouldLogRequests = isDev || shouldLogMobileContext;

const defaultBase = envBase ?? (isDev ? fallbackDevBase : "/api");

if (isDev && !envBase) {
  console.warn(
    "[lib/axios] VITE_API_URL not set — falling back to",
    defaultBase,
    "\nSet VITE_API_URL in .env.development for explicit control."
  );
}

if (shouldLogMobileContext) {
  const origin = hasWindow ? window.location.origin : "n/a";
  console.info("[lib/axios] Runtime context", {
    mode: import.meta.env.MODE,
    baseURL: runtimeBaseURL,
    envBase,
    androidDeviceBase,
    androidEmulatorBase,
    origin,
    isCapacitor,
    isAndroidWebView,
    userAgent,
  });

  if (hasWindow) {
    const logOnlineStatus = (label) => {
      console.info(
        `[lib/axios] Network ${label}. navigator.onLine=${navigator.onLine}`
      );
    };

    window.addEventListener("online", () => logOnlineStatus("ONLINE"));
    window.addEventListener("offline", () => logOnlineStatus("OFFLINE"));
  }
}

const api = axios.create({
  baseURL: runtimeBaseURL,
  withCredentials: true,
  timeout: 30000, // Increased timeout for mobile connections
  headers: {
    "Content-Type": "application/json",
  },
  // Configure for mobile development
  ...(isCapacitor && {
    // Allow self-signed certificates for development
    validateStatus: () => true, // Accept all status codes for debugging
  }),
});

if (shouldLogRequests) {
  console.log("[lib/axios] baseURL =", api.defaults.baseURL);
}

if (shouldLogRequests) {
  api.interceptors.request.use(
    (config) => {
      if (isCapacitor || isAndroidWebView) {
    const token = getStoredToken();

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }
      console.log(
        `➡️ ${config.method?.toUpperCase() || "REQUEST"} ${
          config.baseURL ?? ""
        }${config.url}`
      );
      return config;
    },
    (error) => {
      console.error("❌ Request Error:", error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      const cfg = error.config || {};
      const resolvedUrl = `${cfg.baseURL ?? ""}${cfg.url ?? ""}`;

      // Enhanced error logging for debugging
      console.error("❌ API Error Details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: resolvedUrl,
        method: cfg.method?.toUpperCase(),
        message: error.message,
        code: error.code,
        isOnline: hasNavigator ? navigator.onLine : "unknown",
        isCapacitor,
        userAgent,
        baseURL: cfg.baseURL,
        timeout: cfg.timeout,
        headers: cfg.headers,
        withCredentials: cfg.withCredentials,
      });

      // Log network information
      if (hasNavigator && navigator.connection) {
        console.info("Network Info:", {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt,
        });
      }

      // Log response data if available
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response headers:", error.response.headers);
      }

      return Promise.reject(error);
    }
  );
}

export default api;
