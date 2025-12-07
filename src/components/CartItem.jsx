import { Minus, Plus, Trash } from "lucide-react";
import { useCartStore } from "../hooks/useCartStore";
import formatCurrency from "../lib/formatCurrency";

const CartItem = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCartStore();

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
            src={item.image}
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
              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
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
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all hover:shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0, 128, 128, 0.1) 0%, rgba(0, 51, 102, 0.1) 100%)",
                border: "1px solid rgba(0, 128, 128, 0.2)",
              }}
              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
            >
              <Plus className="w-4 h-4" style={{ color: "#008080" }} />
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
