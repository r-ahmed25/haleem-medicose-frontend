/**
 * Utility functions for authenticated file downloads
 * Supports hybrid authentication: Cookie-based (web) + Bearer token (mobile)
 */
import api from "../lib/axios";

/**
 * Detect authentication method and get appropriate credentials
 */
const getAuthCredentials = () => {
  // Check for Bearer token (mobile/localStorage)
  const token = localStorage.getItem("access_token") || 
                localStorage.getItem("accessToken") || 
                localStorage.getItem("token");
  
  if (token) {
    console.log("Using Bearer token authentication");
    return {
      method: "bearer",
      token,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/pdf"
      }
    };
  }
  
  // No token found - check if we're in a web context where cookies should work
  console.log("No Bearer token found, will try cookie-based authentication");
  return {
    method: "cookie",
    headers: {
      "Accept": "application/pdf"
    }
  };
};

/**
 * Download file using axios (cookie-based auth for web)
 */
const downloadWithAxios = async (url, headers) => {
  const response = await api.get(url, {
    responseType: "blob",
    headers,
    withCredentials: true // Ensure cookies are included
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
    credentials: "include" // Include cookies for web-based auth
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  return response;
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
    
    // Create download link
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    return true;
  } catch (error) {
    console.error("Download error:", error);
    
    // Handle different types of errors
    if (error.response?.status === 401 || error.message.includes("401")) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 403 || error.message.includes("403")) {
      throw new Error("Access denied. You don't have permission to download this file.");
    } else if (error.response?.status === 404 || error.message.includes("404")) {
      throw new Error("Invoice not found.");
    } else {
      throw new Error(error.response?.data?.message || error.message || "Download failed");
    }
  }
};

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
