import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuthStore";
import { useCartStore } from "../hooks/useCartStore";
import formatCurrency from "../lib/formatCurrency";

const ProductCard = ({ product }) => {
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add products to cart", { id: "login" });
      return;
    }
    addToCart(product);
    toast.success("Added to cart");
  };

  const isOutOfStock = typeof product.stock === "number" && product.stock <= 0;

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-xl border border-gray-700/60 bg-transparent shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-150"
      aria-labelledby={`prod-${product._id}`}
    >
      {/* Image (contained + centered) */}
      <div className="relative mx-3 mt-3 h-40 overflow-hidden rounded-lg bg-mute-700/40 flex items-center justify-center p-2">
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
        <div className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/55 px-2 py-0.5 text-xs font-medium text-emerald-300 backdrop-blur-sm">
          {formatCurrency(product.price)}
        </div>

        {isOutOfStock && (
          <div className="absolute top-2 left-2 rounded-md bg-red-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
            Out of stock
          </div>
        )}
      </div>

      {/* Compact content */}
      <div className="mt-3 px-3 pb-3 flex flex-col justify-between gap-2">
        <div>
          <h5
            id={`prod-${product._id}`}
            className="text-sm font-semibold tracking-tight text-white truncate"
          >
            {product.name}
          </h5>

          <p className="mt-1 text-xs text-gray-700 max-h-10 overflow-hidden">
            {`${product.description.slice(0, 80)}...` || "No description available."}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-xs text-gray-300">
              {typeof product.stock === "number"
                ? product.stock > 0
                  ? `${product.stock} in stock`
                  : "Out of stock"
                : product.stock ?? "—"}
            </span>
            <span className="text-[10px] text-gray-500 mt-1">SKU: {product._id?.slice(-6)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/product/${product._id}`}
              className="inline-flex items-center justify-center rounded-md border border-gray-700/40 bg-transparent px-2 py-1 text-xs font-medium text-gray-700 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label={`View details for ${product.name}`}
            >
              Details
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex items-center gap-2 rounded-md px-3 py-1 text-xs font-medium text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
                ${isOutOfStock
                  ? "cursor-not-allowed bg-gray-700/50 opacity-70"
                  : "bg-emerald-600 hover:bg-emerald-700"}
              `}
              aria-disabled={isOutOfStock}
              aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
            >
              <ShoppingCart size={16} />
              <span>{isOutOfStock ? "Unavailable" : "Add"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
