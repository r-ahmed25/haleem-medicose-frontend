import { create } from "zustand";
import toast from "react-hot-toast";
import api from "../lib/axios";

export const useProductStore = create((set, get) => ({
	products: [],
	loading: false,
	error: null,

	setProducts: (products) => set({ products: Array.isArray(products) ? products : [] }),
	createProduct: async (productData) => {
		set({ loading: true });
		try {
			const res = await api.post("/products/addproduct", productData);

			if (res.status >= 200 && res.status < 300) {
				set((prevState) => {
					const currentProducts = Array.isArray(prevState.products) ? prevState.products : [];
					return {
						products: [...currentProducts, res.data.product],
						loading: false,
					};
				});

				toast.success(res.data.message || "Product created successfully");
				return res.data;
			} else {
				throw new Error(`HTTP ${res.status}: ${res.statusText}`);
			}
		} catch (error) {
			console.error("Error in createProduct:", error);
			set({ loading: false });

			if (error.response) {
				console.error("Server error:", error.response.data);
				toast.error(error.response.data?.error || error.response.data?.message || "Server error occurred");
			} else if (error.request) {
				console.error("Network error:", error.request);
				toast.error("Network error - please check your connection");
			} else {
				console.error("Other error:", error.message);
				toast.error(error.message || "An unexpected error occurred");
			}

			throw error;
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
			const products = Array.isArray(response.data.products) ? response.data.products : [];
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
				const currentProducts = Array.isArray(prevProducts.products) ? prevProducts.products : [];
				return {
					products: currentProducts.filter((product) => product._id !== productId),
					loading: false,
				};
			});
			toast.success("Product deleted successfully");
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
				const currentProducts = Array.isArray(prevProducts.products) ? prevProducts.products : [];
				return {
					products: currentProducts.map((product) =>
						product._id === productId ? { ...product, isFeatured: response.data.isFeatured } : product
					),
					loading: false,
				};
			});
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.error || "Failed to update product");
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
}));
