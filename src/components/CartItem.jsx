import { Minus, Plus, Trash, AlertTriangle, Package } from "lucide-react";
import { useCartStore } from "../hooks/useCartStore";
import { useState, useEffect } from "react";
import formatCurrency from "../lib/formatCurrency";

const CartItem = ({ item }) => {
  const { removeFromCart, updateQuantity, cart } = useCartStore();
  const [stockStatus, setStockStatus] = useState({
    availableStock: item.stock ?? item.availableStock ?? null,
    isStockSufficient: true,
    loading: false,
  });

  // Subscribe to cart changes to update stock status
  useEffect(() => {
    const updatedItem = cart.find(
      (cartItem) => cartItem.cartItemId === item.cartItemId
    );
    if (updatedItem && updatedItem.stock !== undefined) {
      setStockStatus((prev) => ({
        ...prev,
        availableStock: updatedItem.stock,
        isStockSufficient: updatedItem.stock >= updatedItem.quantity,
        loading: false,
      }));
    }
  }, [cart, item.cartItemId]);

  // Initialize stock status from cart data
  useEffect(() => {
    const updatedItem = cart.find(
      (cartItem) => cartItem.cartItemId === item.cartItemId
    );
    if (updatedItem && updatedItem.stock !== undefined) {
      setStockStatus({
        availableStock: updatedItem.stock,
        isStockSufficient: updatedItem.stock >= updatedItem.quantity,
        loading: false,
      });
    }
  }, []); // Only run on mount

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(item.cartItemId);
      return;
    }

    setStockStatus((prev) => ({ ...prev, loading: true }));

    // Let the backend handle validation - it will reject if stock is insufficient
    // The cart store subscription will automatically update stock status
    await updateQuantity(item.cartItemId, newQuantity);

    // Set loading to false - the cart subscription will handle the rest
    setStockStatus((prev) => ({ ...prev, loading: false }));
  };

  const getStockDisplayInfo = () => {
    if (stockStatus.loading) {
      return {
        text: "Checking stock...",
        color: "text-gray-500",
        bgColor: "bg-gray-50",
        icon: <Package size={14} />,
      };
    }

    if (stockStatus.availableStock === null) {
      return {
        text: "Stock unknown",
        color: "text-gray-500",
        bgColor: "bg-gray-50",
        icon: <Package size={14} />,
      };
    }

    if (stockStatus.availableStock <= 0) {
      return {
        text: "Out of stock",
        color: "text-red-600",
        bgColor: "bg-red-50",
        icon: <AlertTriangle size={14} />,
      };
    }

    if (stockStatus.availableStock <= 5) {
      return {
        text: `Only ${stockStatus.availableStock} left`,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        icon: <AlertTriangle size={14} />,
      };
    }

    return {
      text: `${stockStatus.availableStock} in stock`,
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: <Package size={14} />,
    };
  };

  const stockInfo = getStockDisplayInfo();

  // Check if we can increase quantity (next quantity must be <= available stock)
  const canIncreaseQuantity = () => {
    if (stockStatus.loading) return false;
    if (stockStatus.availableStock === null) return true; // Allow if stock unknown
    return item.quantity < stockStatus.availableStock;
  };

  return (
    <div
      className="rounded-2xl p-4 md:p-6"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f8fffe 100%)",
        border: "1px solid rgba(0, 128, 128, 0.1)",
        boxShadow: "0 4px 16px rgba(0, 128, 128, 0.06)",
      }}
    >
      <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
        <div className="shrink-0 md:order-1">
          <img
            className="h-20 md:h-32 rounded-xl object-cover"
            src={item.images[0]?.url || ""}
            alt={item.name}
            style={{ border: "1px solid rgba(0, 128, 128, 0.1)" }}
          />
        </div>
        <label className="sr-only">Choose quantity:</label>

        <div className="flex items-center justify-between md:order-3 md:justify-end">
          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all hover:shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0, 128, 128, 0.1) 0%, rgba(0, 51, 102, 0.1) 100%)",
                border: "1px solid rgba(0, 128, 128, 0.2)",
              }}
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={stockStatus.loading}
            >
              <Minus className="w-4 h-4" style={{ color: "#008080" }} />
            </button>
            <span
              className="px-3 py-1 rounded-lg font-semibold min-w-[40px] text-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0, 128, 128, 0.05) 0%, rgba(0, 51, 102, 0.05) 100%)",
                color: "#003366",
              }}
            >
              {item.quantity}
            </span>
            <button
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all hover:shadow-md disabled:opacity-50"
              style={{
                background:
                  canIncreaseQuantity() && !stockStatus.loading
                    ? "linear-gradient(135deg, rgba(0, 128, 128, 0.1) 0%, rgba(0, 51, 102, 0.1) 100%)"
                    : "linear-gradient(135deg, rgba(156, 163, 175, 0.1) 0%, rgba(107, 114, 128, 0.1) 100%)",
                border:
                  canIncreaseQuantity() && !stockStatus.loading
                    ? "1px solid rgba(0, 128, 128, 0.2)"
                    : "1px solid rgba(156, 163, 175, 0.2)",
              }}
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={stockStatus.loading || !canIncreaseQuantity()}
              title={!canIncreaseQuantity() ? "Maximum stock reached" : ""}
            >
              <Plus
                className="w-4 h-4"
                style={{
                  color:
                    canIncreaseQuantity() && !stockStatus.loading
                      ? "#008080"
                      : "#9CA3AF",
                }}
              />
            </button>
          </div>

          <div className="text-end md:order-4 md:w-32">
            <p className="text-lg font-bold" style={{ color: "#008080" }}>
              {formatCurrency(item.price)}
            </p>
          </div>
        </div>

        <div className="w-full min-w-0 flex-1 space-y-3 md:order-2 md:max-w-md">
          <p
            className="text-base font-semibold transition-colors hover:underline"
            style={{ color: "#003366" }}
          >
            {item.name}
          </p>
          <p className="text-sm" style={{ color: "#64748b" }}>
            {item.description}
          </p>

          {/* Stock Status Display */}
          <div className="flex items-center gap-2">
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${stockInfo.bgColor} ${stockInfo.color} border`}
              style={{
                borderColor: stockInfo.color.includes("red")
                  ? "#FECACA"
                  : stockInfo.color.includes("orange")
                  ? "#FED7AA"
                  : stockInfo.color.includes("green")
                  ? "#BBF7D0"
                  : "#E5E7EB",
              }}
            >
              {stockInfo.icon}
              {stockInfo.text}
            </div>

            {!stockStatus.isStockSufficient &&
              stockStatus.availableStock > 0 && (
                <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  Reduce quantity to {stockStatus.availableStock}
                </span>
              )}
          </div>

          <div className="flex items-center gap-4">
            <button
              className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
              style={{ color: "#ef4444" }}
              onClick={() => removeFromCart(item.cartItemId)}
            >
              <Trash className="w-4 h-4" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
