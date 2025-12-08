import { motion } from "framer-motion";
import { useCartStore } from "../hooks/useCartStore";
import { useAuthStore } from "../hooks/useAuthStore";
import { verifyPayment } from "../utils/paymentUtils";
import { MoveRight } from "lucide-react";
import api from "../lib/axios";
import formatCurrency from "../lib/formatCurrency";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const OrderSummary = () => {
  const {
    total,
    subtotal,
    coupon,
    isCouponApplied,
    cart,
    decreaseStockForOrder,
  } = useCartStore();
  const clearCart = useCartStore((state) => state.clearCart);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const savings = subtotal - total;
  const formattedSubtotal = formatCurrency(subtotal.toFixed(2));
  const formattedTotal = formatCurrency(total.toFixed(2));
  const formattedSavings = savings.toFixed(2);

  const handlePayment = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        toast.error("Please login to proceed with payment");
        setIsLoading(false);
        return;
      }

      if (!cart || cart.length === 0) {
        toast.error("Your cart is empty");
        setIsLoading(false);
        return;
      }

      const amountInRupees = Number(total);
      if (amountInRupees <= 0) {
        toast.error("Invalid order amount");
        setIsLoading(false);
        return;
      }

      if (
        typeof window === "undefined" ||
        typeof window.Razorpay === "undefined"
      ) {
        toast.error("Payment system not loaded. Please refresh the page.");
        setIsLoading(false);
        return;
      }

      const amountInPaise = Math.round(amountInRupees * 100);
      console.log(
        "Initiating payment for:",
        amountInRupees,
        "INR =",
        amountInPaise,
        "paise"
      );

      const keyResponse = await api.get("/payment/getkey");
      const { key } = keyResponse.data;
      const response = await api.post("/payment/createcheckout", {
        totalAmount: amountInPaise,
        cartItems: cart,
        couponApplied: isCouponApplied ? coupon : null,
      });

      const { order, orderId } = response.data;
      console.log("Razorpay order created:", order.id);

      const options = {
        key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Haleem Medicos",
        description: "Medicine Purchase",
        order_id: order.id,
        prefill: {
          name: user?.name || "Customer",
          email: user?.email || "",
          contact: "9999999999",
        },
        theme: { color: "#008080" },
        handler: async function (razorResponse) {
          const pendingPayment = {
            payment_id: razorResponse.razorpay_payment_id,
            order_id: order.id,
            signature: razorResponse.razorpay_signature,
            orderItems: cart,
            totalAmount: amountInPaise,
            couponApplied: isCouponApplied ? coupon : null,
          };
          try {
            setIsLoading(true);
            const verifyRes = await verifyPayment(pendingPayment);
            console.log("Payment verification result:", verifyRes);
            if (verifyRes?.needs_address) {
              const pendingPayload = {
                payment_id: pendingPayment.payment_id,
                order_id: pendingPayment.order_id,
                signature: pendingPayment.signature,
                orderItems: cart,
                totalAmount: amountInPaise,
                couponApplied: isCouponApplied ? coupon : null,
              };
              navigate(
                `/location?pendingOrder=${encodeURIComponent(
                  pendingPayload.order_id
                )}`,
                {
                  state: { fromCheckout: true, pendingPayment: pendingPayload },
                }
              );
            }
            if (verifyRes.success) {
              // Decrease stock for ordered items
              try {
                await decreaseStockForOrder(cart);
              } catch (stockError) {
                console.error("Stock update failed:", stockError);
                // Don't block the order completion for stock update failures
              }

              window.dispatchEvent(new CustomEvent("hm:cartClearRequested"));
              navigate(
                `/purchase-success?payment_id=${pendingPayment.payment_id}&order_id=${verifyRes.orderId}`
              );
            } else if (verifyRes.needs_address) {
              navigate(`/location?pendingOrder=${verifyRes.order_id}`, {
                state: { fromCheckout: true, pendingPayment: pendingPayment },
              });
            } else {
              navigate("/purchase-cancel");
            }
          } catch (err) {
            console.error("Verification failed:", err);
            toast.error(
              err?.message || "Payment verification failed. Please try again."
            );
            navigate("/purchase-cancel");
          } finally {
            setIsLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(
        error.response?.data?.message || "Failed to initiate payment"
      );
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="space-y-4 rounded-2xl p-5 sm:p-6 w-full max-w-md mx-auto"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f8fffe 100%)",
        border: "1px solid rgba(0, 128, 128, 0.15)",
        boxShadow: "0 8px 24px rgba(0, 128, 128, 0.08)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p
        className="text-lg sm:text-xl font-bold text-center sm:text-left"
        style={{
          background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Order Summary
      </p>

      <div className="space-y-4">
        <div
          className="space-y-3 p-4 rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 128, 128, 0.03) 0%, rgba(0, 51, 102, 0.03) 100%)",
          }}
        >
          <dl className="flex items-center justify-between gap-2 sm:gap-4">
            <dt
              className="text-sm sm:text-base font-normal"
              style={{ color: "#64748b" }}
            >
              Original price
            </dt>
            <dd
              className="text-sm sm:text-base font-semibold"
              style={{ color: "#334155" }}
            >
              {formattedSubtotal}
            </dd>
          </dl>

          {savings > 0 && (
            <dl className="flex items-center justify-between gap-2 sm:gap-4">
              <dt
                className="text-sm sm:text-base font-normal"
                style={{ color: "#64748b" }}
              >
                Savings
              </dt>
              <dd
                className="text-sm sm:text-base font-semibold"
                style={{ color: "#2ecc71" }}
              >
                -{formattedSavings}
              </dd>
            </dl>
          )}

          {coupon && isCouponApplied && (
            <dl className="flex items-center justify-between gap-2 sm:gap-4">
              <dt
                className="text-sm sm:text-base font-normal"
                style={{ color: "#64748b" }}
              >
                <span className="hidden sm:inline">Coupon ({coupon.code})</span>
                <span className="sm:hidden">Coupon</span>
              </dt>
              <dd
                className="text-sm sm:text-base font-semibold"
                style={{ color: "#2ecc71" }}
              >
                -{coupon.discountPercentage}%
              </dd>
            </dl>
          )}

          <dl
            className="flex items-center justify-between gap-2 sm:gap-4 pt-3"
            style={{ borderTop: "1px solid rgba(0, 128, 128, 0.1)" }}
          >
            <dt
              className="text-base sm:text-lg font-bold"
              style={{ color: "#003366" }}
            >
              Total
            </dt>
            <dd
              className="text-base sm:text-lg font-bold"
              style={{ color: "#008080" }}
            >
              {formattedTotal}
            </dd>
          </dl>
        </div>

        <motion.button
          className="flex w-full items-center justify-center rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
            boxShadow: "0 4px 14px rgba(0, 128, 128, 0.25)",
          }}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          onClick={handlePayment}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Proceed to Checkout"}
        </motion.button>

        <div className="flex items-center justify-center gap-2 pt-2">
          <span
            className="text-xs sm:text-sm font-normal"
            style={{ color: "#94a3b8" }}
          >
            or
          </span>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium underline hover:no-underline transition-colors duration-200"
            style={{ color: "#008080" }}
          >
            Continue Shopping
            <MoveRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSummary;
