import { create } from "zustand";
import api from "../lib/axios";
import { toast } from "react-hot-toast";
import { useProductStore } from "./useProductStore";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,
  isCouponApplied: false,
  refreshTrigger: 0,
  hasCheckedForCoupon: false,
  directDiscountPercentage: 0,
  isDirectDiscountApplied: false,

  triggerStockRefresh: () => {
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 }));
  },

  getMyCoupon: async () => {
    try {
      const response = await api.get("/coupons");
      // Handle case where no coupon is available
      const couponData = response.data;
      set({
        coupon: couponData || null,
      });
    } catch (error) {
      console.error("Error fetching coupon:", error);
      // Set coupon to null and reset applied state on error
      set({ coupon: null, isCouponApplied: false });
    }
  },

  createCouponIfEligible: async (subtotal) => {
    try {
      const response = await api.post("/coupons/create-if-eligible", {
        subtotal,
      });
      if (response.data.coupon) {
        set({ coupon: response.data.coupon });
        toast.success("You've earned a coupon!");
      }
    } catch (error) {
      console.error("Error creating coupon:", error);
    }
  },
  applyCoupon: async (code) => {
    try {
      const response = await api.post("/coupons/validate", { code });
      const couponData = response.data;
      console.log("Applied coupon data:", couponData);
      // Validate coupon data structure
      if (!couponData || !couponData.code || !couponData.discountPercentage) {
        throw new Error("Invalid coupon data received");
      }

      set({
        coupon: couponData,
        isCouponApplied: true,
      });
      get().calculateTotals();
      toast.success(`Coupon "${couponData.code}" applied successfully!`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    }
  },
  removeCoupon: async () => {
    const { coupon } = get();
    if (coupon && coupon.code) {
      try {
        await api.post("/coupons/reactivate", {
          code: coupon.code,
        });
        // Refresh the coupon from server
        await get().getMyCoupon();
        set({ isCouponApplied: false });
        toast.success("Coupon removed and reactivated");
      } catch (error) {
        console.error("Error reactivating coupon:", error);
        set({ coupon: null, isCouponApplied: false });
        toast.success("Coupon removed successfully");
      }
    } else {
      set({ coupon: null, isCouponApplied: false });
      toast.success("Coupon removed successfully");
    }
    get().calculateTotals();
  },

  // Check if coupon was already used in previous orders
  checkCouponUsage: async (couponCode) => {
    try {
      const response = await api.get(
        `/orders?couponCode=${encodeURIComponent(couponCode)}`
      );
      const ordersWithCoupon = response.data?.orders || [];
      return ordersWithCoupon.length > 0;
    } catch (error) {
      console.error("Error checking coupon usage:", error);
      return false; // Assume not used if we can't check
    }
  },

  // Mark coupon as used after successful order
  markCouponAsUsed: async (couponCode) => {
    try {
      // First try the new endpoint
      await api.post("/coupons/mark-as-used", { code: couponCode });
      console.log(`Coupon ${couponCode} marked as used successfully`);
    } catch (error) {
      console.warn(
        "mark-as-used endpoint not available, using fallback:",
        error.message
      );
      try {
        // Fallback: Store used coupon in localStorage for this session
        const usedCoupons = JSON.parse(
          localStorage.getItem("usedCoupons") || "[]"
        );
        if (!usedCoupons.includes(couponCode)) {
          usedCoupons.push(couponCode);
          localStorage.setItem("usedCoupons", JSON.stringify(usedCoupons));
          console.log(`Coupon ${couponCode} marked as used (local fallback)`);
        }
      } catch (fallbackError) {
        console.error("Failed to mark coupon as used:", fallbackError);
      }
    }
  },

  // Check if coupon was used (checks both backend and localStorage)
  isCouponUsed: (couponCode) => {
    try {
      const usedCoupons = JSON.parse(
        localStorage.getItem("usedCoupons") || "[]"
      );
      return usedCoupons.includes(couponCode);
    } catch (error) {
      return false;
    }
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
      toast.error(
        error.response?.data?.message || "Failed to fetch cart items"
      );
    }
  },

  // Check stock status for all cart items and show warnings
  checkCartStockStatus: async (cartItems) => {
    try {
      const stockWarnings = [];

      for (const item of cartItems) {
        if (item.productId && item.quantity > 0) {
          const stockCheck = await get().checkProductStock(
            item.productId,
            item.quantity
          );

          if (!stockCheck.isStockSufficient) {
            stockWarnings.push({
              itemName: item.name,
              requestedQuantity: item.quantity,
              availableStock: stockCheck.availableStock,
            });
          }
        }
      }

      // Show warnings for items with insufficient stock
      if (stockWarnings.length > 0) {
        stockWarnings.forEach((warning, index) => {
          if (warning.availableStock === 0) {
            setTimeout(() => {
              toast.error(
                `"${warning.itemName}" is out of stock and has been removed from your cart`,
                { duration: 5000 }
              );
            }, index * 500);
          } else {
            setTimeout(() => {
              toast.error(
                `Only ${warning.availableStock} "${warning.itemName}" available. Please adjust your quantity.`,
                { duration: 4000 }
              );
            }, index * 500);
          }
        });
      }
    } catch (error) {
      console.error("Error checking cart stock status:", error);
    }
  },
  setDirectDiscount: (percentage) => set({ directDiscountPercentage: Number(percentage) || 0 }),
  toggleDirectDiscount: (enabled) => {
    set({ isDirectDiscountApplied: enabled });
    get().calculateTotals();
  },
  clearDirectDiscount: () => set({ directDiscountPercentage: 0, isDirectDiscountApplied: false }),
  clearCart: async (optimistic = true) => {
    // Optimistic: clear local state immediately so the NavBar badge updates instantly
    if (optimistic) {
      set({ cart: [], coupon: null, total: 0, subtotal: 0 });
    }
    try {
      await api.delete("/cart/clear");
    } catch (error) {
      console.error("Error clearing cart:", error);
      if (!optimistic) {
        set({ cart: [], coupon: null, total: 0, subtotal: 0 });
      }
      toast.error(error.response?.data?.message || "Failed to clear cart");
    }
  },
  addToCart: async (product) => {
    try {
      const productId = product._id?.toString() || product.id?.toString();

      // Skip ID validation for local products and use them directly
      if (productId && productId.match(/^[0-9a-fA-F]{24}$/)) {
        const response = await api.post("/cart/add", {
          productId: product._id,
        });
        console.log(response);

        if (response.data.cartItems) {
          set({ cart: response.data.cartItems });
        }

        toast.success(response.data.message || "Product added to cart");
        get().calculateTotals();
      } else {
        // For local products, just show success message without API call
        toast.success("Product added to cart (local)");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);

      // Check if it's a stock-related error from backend
      const backendAvailableStock = error.response?.data?.availableStock;
      if (backendAvailableStock !== undefined) {
        toast.error(`Only ${backendAvailableStock} available in stock.`, {
          duration: 4000,
        });
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to add product to cart";
        toast.error(errorMessage);
      }
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
          cart: prevState.cart.filter((item) => item.cartItemId !== itemId),
        }));
      }

      toast.success("Item removed from cart");
      get().calculateTotals();
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error(
        error.response?.data?.message || "Failed to remove item from cart"
      );
    }
  },
  // Check product stock in real-time
  checkProductStock: async (productId, requestedQuantity) => {
    try {
      const response = await api.get(`/products/${productId}`);
      const product = response.data;
      const availableStock = product.stock || 0;

      return {
        availableStock,
        isStockSufficient: availableStock >= requestedQuantity,
        product,
      };
    } catch (error) {
      console.error("Error checking product stock:", error);
      // If we can't check stock, allow the operation but warn user
      return {
        availableStock: null,
        isStockSufficient: true, // Default to allowing
        product: null,
      };
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

      // Get current cart item
      const currentCart = get().cart;
      const cartItem = currentCart.find((item) => item.cartItemId === itemId);

      if (!cartItem) {
        toast.error("Cart item not found");
        return;
      }

      const isIncreasing = quantity > cartItem.quantity;

      // Let the backend handle stock validation - it has the most accurate data
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

      // Show success toast with current stock info from backend response
      const updatedItem = response.data.cartItems?.find(
        (item) =>
          item.cartItemId === itemId || item.cartItemId?.toString() === itemId
      );
      const currentStock = updatedItem?.stock;

      if (
        isIncreasing &&
        currentStock !== undefined &&
        currentStock <= 5 &&
        currentStock > 0
      ) {
        toast.success(`Quantity updated! Only ${currentStock} left in stock`, {
          duration: 3000,
        });
      } else {
        toast.success("Quantity updated", { duration: 2000 });
      }

      get().calculateTotals();
    } catch (error) {
      console.error("Error updating quantity:", error);

      // Check if it's a stock-related error from backend
      const backendAvailableStock = error.response?.data?.availableStock;
      if (backendAvailableStock !== undefined) {
        toast.error(
          `Only ${backendAvailableStock} available in stock. Please adjust your quantity.`,
          { duration: 4000 }
        );
      } else if (
        error.response?.data?.message?.toLowerCase().includes("stock") ||
        error.response?.data?.message?.toLowerCase().includes("inventory")
      ) {
        toast.error(
          error.response.data.message || "Insufficient stock available",
          { duration: 4000 }
        );
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update quantity"
        );
      }
    }
  },
  calculateTotals: () => {
    const { cart, coupon, isCouponApplied, hasCheckedForCoupon, directDiscountPercentage, isDirectDiscountApplied } = get();

    const subtotal = cart.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);

    let total = subtotal;

    if (coupon && coupon.discountPercentage && isCouponApplied) {
      const discount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discount;
    } else if (isDirectDiscountApplied && directDiscountPercentage > 0) {
      const discount = subtotal * (directDiscountPercentage / 100);
      total = subtotal - discount;
    }

    const finalSubtotal = isNaN(subtotal) ? 0 : subtotal;
    const finalTotal = isNaN(total) ? 0 : total;

    set({ subtotal: finalSubtotal, total: finalTotal });

    // Check for coupon creation if eligible
    if (finalSubtotal >= 500 && !coupon && !hasCheckedForCoupon) {
      set({ hasCheckedForCoupon: true });
      get().createCouponIfEligible(finalSubtotal);
    }
  },

  // Refresh stock data for all cart items periodically
  refreshCartStockData: async () => {
    try {
      const { cart } = get();
      const updatedCart = [];

      for (const item of cart) {
        if (item.productId) {
          try {
            const stockCheck = await get().checkProductStock(
              item.productId,
              item.quantity
            );
            updatedCart.push({
              ...item,
              availableStock: stockCheck.availableStock,
              stockStatus: stockCheck.isStockSufficient
                ? "sufficient"
                : "insufficient",
            });
          } catch (error) {
            // If stock check fails, keep original item
            updatedCart.push(item);
          }
        } else {
          updatedCart.push(item);
        }
      }

      set({ cart: updatedCart });
    } catch (error) {
      console.error("Error refreshing cart stock data:", error);
    }
  },

  // Decrease stock for ordered items
  decreaseStockForOrder: async (orderItems) => {
    try {
      console.log(
        `[DECREASE_STOCK_FOR_ORDER] Starting stock decrease for ${orderItems.length} items`
      );

      const stockUpdatePromises = orderItems.map(async (item, index) => {
        console.log(
          `[DECREASE_STOCK_FOR_ORDER] Processing item ${index + 1}/${
            orderItems.length
          }:`,
          {
            productId: item.productId,
            quantity: item.quantity,
            name: item.name,
          }
        );

        if (item.productId && item.quantity > 0) {
          try {
            console.log(
              `[DECREASE_STOCK_FOR_ORDER] Calling API for product ${item.productId}`
            );
            const response = await api.put(
              `/products/${item.productId}/decrease-stock`,
              {
                quantity: item.quantity,
              }
            );
            console.log(
              `[DECREASE_STOCK_FOR_ORDER] API response for ${item.productId}:`,
              response.data
            );
            return {
              success: true,
              productId: item.productId,
              data: response.data,
            };
          } catch (error) {
            console.error(
              `[DECREASE_STOCK_FOR_ORDER] Error decreasing stock for product ${item.productId}:`,
              {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: error.config?.url,
              }
            );
            return { success: false, productId: item.productId, error };
          }
        }
        return {
          success: true,
          productId: item.productId,
          message: "Skipped (no productId or quantity)",
        };
      });

      const results = await Promise.all(stockUpdatePromises);
      const failedUpdates = results.filter((result) => !result.success);

      console.log(`[DECREASE_STOCK_FOR_ORDER] Results:`, {
        total: results.length,
        successful: results.length - failedUpdates.length,
        failed: failedUpdates.length,
        results: results,
      });

      if (failedUpdates.length > 0) {
        console.warn(
          "[DECREASE_STOCK_FOR_ORDER] Some stock updates failed:",
          failedUpdates
        );
        toast.error(
          "Order placed successfully, but some stock updates failed. Please contact support."
        );
      } else {
        console.log(
          "[DECREASE_STOCK_FOR_ORDER] All stock updates successful - clearing cart"
        );
        toast.success("Order confirmed! Stock updated successfully.", {
          duration: 3000,
        });

        // Mark coupon as used if one was applied
        const { coupon, isCouponApplied } = get();
        if (isCouponApplied && coupon && coupon.code) {
          await get().markCouponAsUsed(coupon.code);
        }

        // Clear the cart since order was successful
        set({ cart: [], coupon: null, total: 0, subtotal: 0 });

        // Also refresh cart stock data to update any remaining items
        get().refreshCartStockData();
      }

      return results;
    } catch (error) {
      console.error(
        "[DECREASE_STOCK_FOR_ORDER] Error in bulk stock update:",
        error
      );
      toast.error(
        "Order placed successfully, but stock update failed. Please contact support."
      );
    }
  },
}));



