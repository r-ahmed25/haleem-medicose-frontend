import { motion } from "framer-motion";
import { useCartStore } from "../hooks/useCartStore";
import { useAuthStore } from "../hooks/useAuthStore";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Tag, CheckCircle, AlertTriangle, User, Phone } from "lucide-react";
import api from "../lib/axios";
import formatCurrency from "../lib/formatCurrency";
import { toast } from "react-hot-toast";

const SaleReview = () => {
  const { cart, total, subtotal, coupon, isCouponApplied, markCouponAsUsed, isDirectDiscountApplied, directDiscountPercentage, clearDirectDiscount } = useCartStore();
  const clearCart = useCartStore((state) => state.clearCart);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isFinalizing, setIsFinalizing] = useState(false);
  const hasFinalized = useRef(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    // Don't redirect if we just finalized the sale (clearCart triggers re-render
    // and would otherwise redirect before navigation to /sale-complete takes effect)
    if (hasFinalized.current) return;

    if (!cart || cart.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
    }
  }, [cart, navigate]);

  const savings = subtotal - total;

  const handleFinalizeSale = async () => {
    if (isFinalizing) return;
    setIsFinalizing(true);

    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        toast.error("Please login to proceed");
        setIsFinalizing(false);
        return;
      }

      if (!cart || cart.length === 0) {
        toast.error("Cart is empty");
        setIsFinalizing(false);
        return;
      }

      if (Number(total) <= 0) {
        toast.error("Invalid order total");
        setIsFinalizing(false);
        return;
      }

      const orderItems = cart.map((item) => ({
        product: item.productId || item._id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
      }));

      const payload = {
        orderItems,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        couponApplied:
          isCouponApplied && coupon
            ? { code: coupon.code, discountPercentage: coupon.discountPercentage }
            : null,
        directDiscountPercentage: isDirectDiscountApplied ? directDiscountPercentage : 0,
      };

      const response = await api.post("/sales/create", payload);

      if (response.data.success) {
        if (isCouponApplied && coupon?.code) {
          await markCouponAsUsed(coupon.code);
        }

        // Set flag BEFORE clearing cart so the empty-cart effect doesn't redirect
        hasFinalized.current = true;

        // Clear cart (optimistic update will set cart to [] immediately)
        clearCart();
        clearDirectDiscount();

        // Navigate to SaleComplete with order data
        navigate("/sale-complete", {
          state: {
            order: response.data.order,
            invoiceBase64: response.data.invoiceBase64,
          },
        });
      } else {
        toast.error(response.data.message || "Failed to process sale");
      }
    } catch (error) {
      console.error("Finalize sale error:", error);
      const msg = error.response?.data?.message || error.message || "Failed to process sale";
      const availableStock = error.response?.data?.availableStock;
      if (availableStock !== undefined) {
        toast.error(`Only ${availableStock} available in stock. Please adjust quantities.`);
      } else {
        toast.error(msg);
      }
    } finally {
      setIsFinalizing(false);
    }
  };

  if (!cart || cart.length === 0) return null;

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{
        background: "linear-gradient(180deg, #f8fffe 0%, #f0f9f7 100%)",
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/cart")}
            className="p-2 rounded-lg transition-all hover:shadow-md"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 128, 128, 0.1) 0%, rgba(0, 51, 102, 0.1) 100%)",
            }}
          >
            <ArrowLeft size={20} style={{ color: "#008080" }} />
          </button>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{
              background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Review Sale
          </h1>
        </div>

        {/* Items Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl p-5 sm:p-6 mb-4"
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #f8fffe 100%)",
            border: "1px solid rgba(0, 128, 128, 0.15)",
            boxShadow: "0 8px 24px rgba(0, 128, 128, 0.08)",
          }}
        >
          <h2
            className="text-lg font-bold mb-4"
            style={{
              background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Cart Items ({cart.length})
          </h2>

          <div className="space-y-3">
            {cart.map((item, idx) => (
              <div
                key={item.cartItemId || idx}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0, 128, 128, 0.03) 0%, rgba(0, 51, 102, 0.03) 100%)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0, 128, 128, 0.1) 0%, rgba(0, 51, 102, 0.1) 100%)",
                    color: "#008080",
                  }}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#003366" }}>
                    {item.name}
                  </p>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>
                    Qty: {item.quantity} × {formatCurrency(item.price?.toFixed(2) || "0.00")}
                  </p>
                </div>
                <span className="text-sm font-bold shrink-0" style={{ color: "#008080" }}>
                  {formatCurrency(((item.price || 0) * (item.quantity || 0)).toFixed(2))}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Totals Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl p-5 sm:p-6 mb-6"
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #f8fffe 100%)",
            border: "1px solid rgba(0, 128, 128, 0.15)",
            boxShadow: "0 8px 24px rgba(0, 128, 128, 0.08)",
          }}
        >
          <h2
            className="text-lg font-bold mb-4"
            style={{
              background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Payment Summary
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span style={{ color: "#64748b" }}>Subtotal</span>
              <span className="font-semibold" style={{ color: "#334155" }}>
                {formatCurrency(subtotal.toFixed(2))}
              </span>
            </div>

            {savings > 0 && (
              <div className="flex justify-between text-sm">
                <span style={{ color: "#64748b" }}>Savings</span>
                <span className="font-semibold" style={{ color: "#2ecc71" }}>
                  -{formatCurrency(savings.toFixed(2))}
                </span>
              </div>
            )}

            {coupon && isCouponApplied && (
              <div className="flex justify-between text-sm">
                <span style={{ color: "#64748b" }}>
                  <Tag size={14} className="inline mr-1" />
                  {coupon.code} ({coupon.discountPercentage}% off)
                </span>
                <span className="font-semibold" style={{ color: "#2ecc71" }}>
                  {formatCurrency((subtotal * coupon.discountPercentage / 100).toFixed(2))}
                </span>
              </div>
            )}

            <div
              className="flex justify-between items-center pt-3"
              style={{ borderTop: "1px solid rgba(0, 128, 128, 0.1)" }}
            >
              <span className="text-lg font-bold" style={{ color: "#003366" }}>
                Grand Total
              </span>
              <span className="text-xl font-bold" style={{ color: "#008080" }}>
                {formatCurrency(total.toFixed(2))}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Customer Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-2xl p-5 sm:p-6 mb-6"
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #f8fffe 100%)",
            border: "1px solid rgba(0, 128, 128, 0.15)",
            boxShadow: "0 8px 24px rgba(0, 128, 128, 0.08)",
          }}
        >
          <h2
            className="text-lg font-bold mb-4"
            style={{
              background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Customer Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "#003366" }}>
                <User size={14} className="inline mr-1" />
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Optional"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-teal-100 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "#003366" }}>
                <Phone size={14} className="inline mr-1" />
                Customer Phone
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Optional"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-teal-100 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-sm transition-all hover:shadow-lg flex-1"
            style={{
              background: "transparent",
              border: "2px solid #008080",
              color: "#008080",
            }}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <button
            onClick={handleFinalizeSale}
            disabled={isFinalizing}
            className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-sm transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            style={{
              background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
              color: "white",
              boxShadow: "0 4px 14px rgba(0, 128, 128, 0.25)",
            }}
          >
            {isFinalizing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Finalize Sale
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default SaleReview;


