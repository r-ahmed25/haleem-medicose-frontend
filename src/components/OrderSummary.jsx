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



// ✅ OrderSummary Component
const OrderSummary = () => {
  const { total, subtotal, coupon, isCouponApplied, cart } = useCartStore();
  const clearCart = useCartStore((state) => state.clearCart);
  const {user} = useAuthStore();
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

      if (typeof window === "undefined" || typeof window.Razorpay === "undefined") {
        toast.error("Payment system not loaded. Please refresh the page.");
        setIsLoading(false);
        return;
      }

      const amountInPaise = Math.round(amountInRupees * 100);
      console.log("Initiating payment for:", amountInRupees, "INR =", amountInPaise, "paise");

      const keyResponse = await api.get("/payment/getkey");
      const { key } = keyResponse.data;
      const response = await api.post("/payment/createcheckout", {
        totalAmount: amountInPaise,
        cartItems: cart,
        couponApplied: isCouponApplied ? coupon : null
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
        theme: { color: "#2E9797" },
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
       const verifyRes  = await verifyPayment(pendingPayment);
       console.log("Payment verification result:", verifyRes);
 if (verifyRes?.needs_address) {
    const pendingPayload = {
      payment_id: pendingPayment.payment_id,
      order_id: pendingPayment.order_id,
      signature: pendingPayment.signature,
      orderItems: cart,
      totalAmount: amountInPaise,
      couponApplied: isCouponApplied ? coupon : null
    };
     navigate(`/location?pendingOrder=${encodeURIComponent(pendingPayload.order_id)}`, {
     state: { fromCheckout: true, pendingPayment: pendingPayload }
});
  }
    if (verifyRes.success) {
      // ✅ Order created successfully
      window.dispatchEvent(new CustomEvent("hm:cartClearRequested"));
      navigate(`/purchase-success?payment_id=${pendingPayment.payment_id}&order_id=${verifyRes.orderId}`);
    } else if (verifyRes.needs_address) {
      // ⚠️ User needs to add address → redirect to location page
      navigate(`/location?pendingOrder=${verifyRes.order_id}`, {
        state: { fromCheckout: true, pendingPayment: pendingPayment },
      });
    } else {
      navigate("/purchase-cancel");
    }
        //            await clearCart();

     //   navigate(`/purchase-success?payment_id=${verifyRes.payment_id}`);

    } catch (err) {
      console.error("Verification failed:", err);
        const serverData = err?.response?.data;
  
  toast.error(err?.message || "Payment verification failed. Please try again.");
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
      toast.error(error.response?.data?.message || "Failed to initiate payment");
      setIsLoading(false);
    }
  };


  // ✅ JSX
  return (
    <motion.div
      className="space-y-4 rounded-lg border border-gray-700 bg-mute-600 p-4 shadow-sm sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-xl font-semibold text-green-700">Order summary</p>

      <div className="space-y-4">
        <div className="space-y-2">
          <dl className="flex items-center justify-between gap-4">
            <dt className="text-base font-normal text-gray-700">Original price</dt>
            <dd className="text-base font-medium text-white">{formattedSubtotal}</dd>
          </dl>

          {savings > 0 && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">Savings</dt>
              <dd className="text-base font-medium text-emerald-400">-{formattedSavings}</dd>
            </dl>
          )}

          {coupon && isCouponApplied && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">
                Coupon ({coupon.code})
              </dt>
              <dd className="text-base font-medium text-emerald-400">
                -{coupon.discountPercentage}%
              </dd>
            </dl>
          )}

          <dl className="flex items-center justify-between gap-4 border-t border-gray-600 pt-2">
            <dt className="text-base font-bold text-white">Total</dt>
            <dd className="text-base font-bold text-green-700">{formattedTotal}</dd>
          </dl>
        </div>

        <motion.button
          className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePayment}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Proceed to Checkout"}
        </motion.button>

        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-normal text-gray-400">or</span>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-green-700 underline hover:text-emerald-300 hover:no-underline"
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
