import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "../hooks/useAuthStore";
import { useCartStore } from "../hooks/useCartStore";
import formatCurrency from "../lib/formatCurrency";

const ProductCard = ({ product }) => {
  const { user } = useAuthStore();
  const { addToCart, checkProductStock, refreshTrigger } = useCartStore();
  const [realTimeStock, setRealTimeStock] = useState(product.stock);
  const [isLoadingStock, setIsLoadingStock] = useState(false);

  // Fetch real-time stock on mount, periodically, and when refresh is triggered
  useEffect(() => {
    const fetchStock = async () => {
      if (product._id) {
        setIsLoadingStock(true);
        try {
          const stockCheck = await checkProductStock(product._id, 1);
          if (stockCheck.availableStock !== null) {
            setRealTimeStock(stockCheck.availableStock);
          }
        } catch (error) {
          console.error("Error fetching stock:", error);
        } finally {
          setIsLoadingStock(false);
        }
      }
    };

    fetchStock();

    // Refresh stock every 30 seconds
    const interval = setInterval(fetchStock, 30000);

    return () => clearInterval(interval);
  }, [product._id, checkProductStock, refreshTrigger]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add products to cart", { id: "login" });
      return;
    }

    // Check stock before adding
    if (realTimeStock !== null && realTimeStock <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    await addToCart(product);

    // Refresh stock after adding to cart
    if (product._id) {
      const stockCheck = await checkProductStock(product._id, 1);
      if (stockCheck.availableStock !== null) {
        setRealTimeStock(stockCheck.availableStock);
      }
    }
  };

  const isOutOfStock = typeof realTimeStock === "number" && realTimeStock <= 0;

  return (
    <div
      className="emerald-inset-card relative flex flex-col overflow-hidden rounded-xl transform hover:-translate-y-0.5 transition-all duration-150 w-full max-w-full box-border"
      aria-labelledby={`prod-${product._id}`}
    >
      {/* Image (contained + centered) */}
      <div className="relative mx-2 sm:mx-3 mt-2 sm:mt-3 h-32 sm:h-40 overflow-hidden rounded-lg bg-mute-700/40 flex items-center justify-center p-2">
        {/* image uses object-contain and centered to show full product */}
        <img
          src={product.thumbnail || product.image || ""}
          alt={product.name || "product image"}
          className="max-h-full max-w-full object-contain object-center"
          onError={(e) => {
            if (product.image && e.currentTarget.src !== product.image) {
              e.currentTarget.src = product.image;
            } else {
              e.currentTarget.style.display = "none";
            }
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />

        {/* Small price chip */}
        <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 inline-flex items-center gap-1 rounded-md bg-black/55 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium text-emerald-300 backdrop-blur-sm">
          {formatCurrency(product.price)}
        </div>

        {isOutOfStock && (
          <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 rounded-md bg-red-600 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-white shadow">
            Out of stock
          </div>
        )}
      </div>

      {/* Compact content */}
      <div className="mt-2 sm:mt-3 px-2 sm:px-3 pb-2 sm:pb-3 flex flex-col justify-between gap-2 overflow-hidden">
        <div className="min-w-0">
          <h5
            id={`prod-${product._id}`}
            className="text-xs sm:text-sm font-semibold tracking-tight text-white truncate"
          >
            {product.name}
          </h5>

          <p className="mt-1 text-[10px] sm:text-xs text-gray-700 max-h-8 overflow-hidden line-clamp-2">
            {`${product.description?.slice(0, 40) || "No description"}...`}
          </p>
        </div>

        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] sm:text-xs text-[#008080] font-medium truncate">
              {isLoadingStock
                ? "Checking..."
                : typeof realTimeStock === "number"
                ? realTimeStock > 0
                  ? `${realTimeStock} in stock`
                  : "Out of stock"
                : realTimeStock ?? "—"}
            </span>
            <span className="text-[9px] sm:text-[10px] text-gray-300 mt-0.5">
              SKU: {product._id?.slice(-6)}
            </span>
          </div>

          {/* Buttons - wrap on mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
            <Link
              to={`/product/${product._id}`}
              className="inline-flex items-center justify-center rounded-md border border-[#008080] bg-[#008080] px-2 py-1 text-[10px] sm:text-xs font-medium text-white hover:bg-[#003366] hover:border-[#003366] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2ecc71] whitespace-nowrap transition-colors"
              aria-label={`View details for ${product.name}`}
            >
              Details
            </Link>

            {user?.role !== "admin" && (
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex items-center gap-1 sm:gap-2 rounded-md px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 whitespace-nowrap
                  ${
                    isOutOfStock
                      ? "cursor-not-allowed bg-gray-700/50 opacity-70"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }
                `}
                aria-disabled={isOutOfStock}
                aria-label={
                  isOutOfStock
                    ? `${product.name} is out of stock`
                    : `Add ${product.name} to cart`
                }
              >
                <ShoppingCart size={14} className="sm:w-4 sm:h-4" />
                <span>{isOutOfStock ? "N/A" : "Add"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
