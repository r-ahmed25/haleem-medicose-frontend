import { create } from "zustand";
import api from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
	cart: [],
	coupon: null,
	total: 0,
	subtotal: 0,
	isCouponApplied: false,

	getMyCoupon: async () => {
		try {
			const response = await api.get("/coupons");
			set({ coupon: response.data });
		} catch (error) {
			console.error("Error fetching coupon:", error);
		}
	},
	applyCoupon: async (code) => {
		try {
			const response = await api.post("/coupons/validate", { code });
			set({ coupon: response.data, isCouponApplied: true });
			get().calculateTotals();
			toast.success("Coupon applied successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to apply coupon");
		}
	},
	removeCoupon: () => {
		set({ coupon: null, isCouponApplied: false });
		get().calculateTotals();
		toast.success("Coupon removed");
	},

	getCartItems: async () => {
		try {
			const res = await api.get("/cart");
			// The response should be an array of cart items with product details
			const cartItems = Array.isArray(res.data) ? res.data : [];
			set({ cart: cartItems });
			get().calculateTotals();
		} catch (error) {
			console.error("Error fetching cart items:", error);
			set({ cart: [] });
			toast.error(error.response?.data?.message || "Failed to fetch cart items");
		}
	},
	clearCart: async () => {
		try {
			const res = await api.delete("/cart/clear");
			set({ cart: [], coupon: null, total: 0, subtotal: 0 });
		} catch (error) {
			console.error("Error clearing cart:", error);
			set({ cart: [], coupon: null, total: 0, subtotal: 0 });
			toast.error(error.response?.data?.message || "Failed to clear cart");
		}
	},
	addToCart: async (product) => {
		try {
			const productId = product._id.toString();
			if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
				toast.error("Invalid product identifier");
				return;
			}

			const response = await api.post("/cart/add", { productId: product._id });
			console.log(response)

			if (response.data.cartItems) {
				set({ cart: response.data.cartItems });
			}

			toast.success(response.data.message || "Product added to cart");
			get().calculateTotals();
		} catch (error) {
			console.error("Error adding to cart:", error);
			const errorMessage = error.response?.data?.message ||
				error.response?.data?.error ||
				"Failed to add product to cart";
			toast.error(errorMessage);
		}
	},
	removeFromCart: async (itemId) => {
	  itemId = itemId.toString();
	  if (!itemId || !itemId.match(/^[0-9a-fA-F]{24}$/)) {
	    toast.error("Invalid cart item ID");
	    return;
	  }
	  try {
	    const response = await api.delete(`/cart/${itemId}`);

	    if (response.data.cartItems) {
	      set({ cart: response.data.cartItems });
	    } else {
	      set((prevState) => ({
	        cart: prevState.cart.filter((item) => item.cartItemId !== itemId)
	      }));
	    }

	    toast.success("Item removed from cart");
	    get().calculateTotals();
	  } catch (error) {
	    console.error("Error removing from cart:", error);
	    toast.error(error.response?.data?.message || "Failed to remove item from cart");
	  }
	},
	updateQuantity: async (itemId, quantity) => {
	  itemId = itemId.toString();
	  if (!itemId || !itemId.match(/^[0-9a-fA-F]{24}$/)) {
	    toast.error("Invalid cart item ID");
	    return;
	  }
	  try {
	    if (quantity <= 0) {
	      get().removeFromCart(itemId);
	      return;
	    }

	    const response = await api.put(`/cart/${itemId}`, { quantity });

	    if (response.data.cartItems) {
	      set({ cart: response.data.cartItems });
	    } else {
	      set((prevState) => ({
	        cart: prevState.cart.map((item) =>
	          item.cartItemId === itemId ? { ...item, quantity } : item
	        ),
	      }));
	    }

	    get().calculateTotals();
	  } catch (error) {
	    console.error("Error updating quantity:", error);
	    toast.error(error.response?.data?.message || "Failed to update quantity");
	  }
	},
	calculateTotals: () => {
		const { cart, coupon } = get();

		const subtotal = cart.reduce((sum, item) => {
			const price = parseFloat(item.price) || 0;
			const quantity = parseInt(item.quantity) || 0;
			return sum + (price * quantity);
		}, 0);

		let total = subtotal;

		if (coupon && coupon.discountPercentage) {
			const discount = subtotal * (coupon.discountPercentage / 100);
			total = subtotal - discount;
		}

		const finalSubtotal = isNaN(subtotal) ? 0 : subtotal;
		const finalTotal = isNaN(total) ? 0 : total;

		set({ subtotal: finalSubtotal, total: finalTotal });
	},
}));
