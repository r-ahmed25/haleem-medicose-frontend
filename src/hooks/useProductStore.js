import { create } from "zustand";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { useCartStore } from "./useCartStore";

export const useProductStore = create((set, get) => ({
  products: [],
  categories: [],
  loading: false,
  error: null,

  setProducts: (products) =>
    set({ products: Array.isArray(products) ? products : [] }),
  setCategories: (categories) =>
    set({ categories: Array.isArray(categories) ? categories : [] }),
  createProduct: async (productData) => {
    set({ loading: true });
    const maxRetries = 3;
    const baseDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await api.post("/products/addproduct", productData);

        if (res.status >= 200 && res.status < 300) {
          set((prevState) => {
            const currentProducts = Array.isArray(prevState.products)
              ? prevState.products
              : [];
            return {
              products: [...currentProducts, res.data.product],
              loading: false,
            };
          });

          toast.success(res.data.message || "Product created successfully");
          get().refreshAdminAlerts();
          return res.data;
        } else {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
      } catch (error) {
        console.error(`Error in createProduct (attempt ${attempt}):`, error);

        const isNetworkError =
          !error.response ||
          error.code === "ECONNABORTED" ||
          error.message.includes("timeout") ||
          error.message.includes("Network Error");

        if (isNetworkError && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          toast.error(
            `Network issue. Retrying in ${delay / 1000}s... (${attempt}/${maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        set({ loading: false });

        if (error.response) {
          console.error("Server error:", error.response.data);
          toast.error(
            error.response.data?.error ||
              error.response.data?.message ||
              "Server error occurred"
          );
        } else if (error.request) {
          console.error("Network error:", error.request);
          toast.error(
            "Network error - please check your connection and try again"
          );
        } else {
          console.error("Other error:", error.message);
          toast.error(error.message || "An unexpected error occurred");
        }

        throw error;
      }
    }
  },
  fetchAllProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/products");
      const products = Array.isArray(response.data) ? response.data : [];
      set({ products, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false, products: [] });
      toast.error(error.response?.data?.error || "Failed to fetch products");
    }
  },
  fetchProductsByCategory: async (category) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/products/category/${category}`);
      const products = Array.isArray(response.data.products)
        ? response.data.products
        : [];
      set({ products, loading: false });
      get().setProducts(products);
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false, products: [] });
      toast.error(error.response?.data?.error || "Failed to fetch products");
    }
  },
  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      await api.delete(`/products/${productId}`);
      set((prevProducts) => {
        const currentProducts = Array.isArray(prevProducts.products)
          ? prevProducts.products
          : [];
        return {
          products: currentProducts.filter(
            (product) => product._id !== productId
          ),
          loading: false,
        };
      });
      toast.success("Product deleted successfully");
      get().refreshAdminAlerts();
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.error || "Failed to delete product");
    }
  },
  toggleFeaturedProduct: async (productId) => {
    set({ loading: true });
    try {
      const response = await api.patch(`/products/${productId}`);
      set((prevProducts) => {
        const currentProducts = Array.isArray(prevProducts.products)
          ? prevProducts.products
          : [];
        return {
          products: currentProducts.map((product) =>
            product._id === productId
              ? { ...product, isFeatured: response.data.isFeatured }
              : product
          ),
          loading: false,
        };
      });
      toast.success("Product featured status updated");
      get().refreshAdminAlerts();
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.error || "Failed to update product");
    }
  },
  updateProduct: async (productId, productData) => {
    set({ loading: true });
    try {
      // Backend now handles mobile timeouts properly, use default axios timeout
      const response = await api.put(`/products/${productId}`, productData);
      set((prevProducts) => {
        const currentProducts = Array.isArray(prevProducts.products)
          ? prevProducts.products
          : [];
        return {
          products: currentProducts.map((product) =>
            product._id === productId
              ? { ...product, ...response.data.product }
              : product
          ),
          loading: false,
        };
      });

      const isMobile =
        window.innerWidth <= 768 ||
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      toast.success(
        isMobile
          ? "Product updated successfully on mobile!"
          : "Product updated successfully"
      );
      get().refreshAdminAlerts();
      return response.data;
    } catch (error) {
      set({ loading: false });

      const isMobile =
        window.innerWidth <= 768 ||
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        if (isMobile) {
          toast.error(
            "Mobile update timed out. The server is processing your image, please wait..."
          );
        } else {
          toast.error("Update timed out. Please try again.");
        }
      } else if (error.response?.status === 413) {
        toast.error("Image too large. Please select a smaller image.");
      } else if (error.response?.status === 408) {
        toast.error(
          "Server timeout. Please try with a smaller image or check your connection."
        );
      } else {
        toast.error(error.response?.data?.error || "Failed to update product");
      }

      throw error;
    }
  },
  fetchFeaturedProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/products/featured");
      const products = Array.isArray(response.data) ? response.data : [];
      set({ products, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false, products: [] });
      toast.error("Error fetching featured products:", error);
    }
  },
  fetchCategories: async () => {
    try {
      const response = await api.get("/categories");
      const categories = Array.isArray(response.data) ? response.data : [];
      set({ categories });
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  },
  refreshAdminAlerts: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("refresh-admin-alerts"));
    }
  },
  addCategory: async (name) => {
    try {
      const res = await api.post("/categories/add", { name });
      if (res.data?.success) {
        get().fetchCategories();
        toast.success(res.data.message || "Category added successfully");
        return res.data;
      }
      throw new Error(res.data?.message || "Failed to add category");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to add category";
      toast.error(message);
      throw error;
    }
  },
  updateCategory: async (id, name) => {
    try {
      const res = await api.put(`/categories/${id}`, { name });
      if (res.data?.success) {
        get().fetchCategories();
        toast.success(res.data.message || "Category updated successfully");
        return res.data;
      }
      throw new Error(res.data?.message || "Failed to update category");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update category";
      toast.error(message);
      throw error;
    }
  },
  deleteCategory: async (id) => {
    try {
      const res = await api.delete(`/categories/${id}`);
      if (res.data?.success) {
        get().fetchCategories();
        toast.success(res.data.message || "Category deleted successfully");
        return res.data;
      }
      throw new Error(res.data?.message || "Failed to delete category");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to delete category";
      toast.error(message);
      throw error;
    }
  },
}));
