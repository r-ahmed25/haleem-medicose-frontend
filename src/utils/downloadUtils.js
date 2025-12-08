/**
 * Utility functions for authenticated file downloads
 * Supports hybrid authentication: Cookie-based (web) + Bearer token (mobile)
 * Uses Capacitor Filesystem for native mobile apps and FileSaver for web
 */
import api from "../lib/axios";
import { saveAs } from "file-saver";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";

/**
 * Detect authentication method and get appropriate credentials
 */
const getAuthCredentials = () => {
  // Check for Bearer token (mobile/localStorage)
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");

  if (token) {
    console.log("Using Bearer token authentication");
    return {
      method: "bearer",
      token,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/pdf",
      },
    };
  }

  // No token found - check if we're in a web context where cookies should work
  console.log("No Bearer token found, will try cookie-based authentication");
  return {
    method: "cookie",
    headers: {
      Accept: "application/pdf",
    },
  };
};

/**
 * Download file using axios (cookie-based auth for web)
 */
const downloadWithAxios = async (url, headers) => {
  const response = await api.get(url, {
    responseType: "blob",
    headers,
    withCredentials: true, // Ensure cookies are included
  });
  return response;
};

/**
 * Download file using fetch (token-based auth for mobile)
 */
const downloadWithFetch = async (url, headers) => {
  const response = await fetch(url, {
    method: "GET",
    headers,
    credentials: "include", // Include cookies for web-based auth
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response;
};

/**
 * Download file using Capacitor Filesystem API (for native mobile apps)
 */
const downloadWithCapacitor = async (blob, filename) => {
  try {
    // Convert blob to base64
    const base64Data = await blobToBase64(blob);
    
    // Write file to Documents directory
    await Filesystem.writeFile({
      path: filename,
      data: base64Data,
      directory: Directory.Documents,
    });
    
    console.log("File saved to Documents directory:", filename);
    return true;
  } catch (error) {
    console.error("Capacitor download error:", error);
    throw error;
  }
};

/**
 * Convert blob to base64
 */
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Download a file with proper hybrid authentication support
 * @param {string} url - The full API URL
 * @param {string} filename - The filename for the downloaded file
 */
export const downloadAuthenticatedFile = async (url, filename) => {
  try {
    console.log("Downloading file from:", url);

    // Get authentication credentials
    const auth = getAuthCredentials();
    console.log("Auth method:", auth.method);

    let response, blob;

    if (auth.method === "bearer") {
      // Mobile: Use fetch with Bearer token
      console.log("Using fetch with Bearer token");
      const fetchResponse = await downloadWithFetch(url, auth.headers);
      blob = await fetchResponse.blob();
    } else {
      // Web: Use axios with cookies
      console.log("Using axios with cookies");
      const axiosResponse = await downloadWithAxios(url, auth.headers);
      blob = axiosResponse.data;
    }

    console.log("Download response received, blob size:", blob.size);

    // Check if running in Capacitor native platform
    if (Capacitor.isNativePlatform()) {
      console.log("Native platform detected, using Capacitor Filesystem");
      await downloadWithCapacitor(blob, filename);
    } else {
      console.log("Web platform detected, using FileSaver.js");
      saveAs(blob, filename);
    }

    return true;
  } catch (error) {
    console.error("Download error:", error);

    // Handle different types of errors
    if (error.response?.status === 401 || error.message.includes("401")) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (
      error.response?.status === 403 ||
      error.message.includes("403")
    ) {
      throw new Error(
        "Access denied. You don't have permission to download this file."
      );
    } else if (
      error.response?.status === 404 ||
      error.message.includes("404")
    ) {
      throw new Error("Invoice not found.");
    } else {
      throw new Error(
        error.response?.data?.message || error.message || "Download failed"
      );
    }
  }
};

/**
 * Enhanced download function using FileSaver.js
 * Provides better cross-browser and mobile support
 */

/**
 * Generate filename for invoice download
 * @param {string} orderId - The order ID
 * @param {string} extension - File extension (default: pdf)
 * @returns {string} Formatted filename
 */
export const generateInvoiceFilename = (orderId, extension = "pdf") => {
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return `invoice-${orderId}-${timestamp}.${extension}`;
};
