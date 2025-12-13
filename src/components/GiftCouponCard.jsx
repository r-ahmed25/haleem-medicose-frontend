import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useCartStore } from "../hooks/useCartStore";
import { Gift, Tag, X } from "lucide-react";
import { toast } from "react-hot-toast";

const GiftCouponCard = () => {
  const [userInputCode, setUserInputCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const { coupon, isCouponApplied, applyCoupon, getMyCoupon, removeCoupon } =
    useCartStore();

  useEffect(() => {
    getMyCoupon();
  }, [getMyCoupon]);

  useEffect(() => {
    if (coupon) setUserInputCode(coupon.code);
  }, [coupon]);

  const handleApplyCoupon = async () => {
    const trimmedCode = userInputCode.trim();
    if (!trimmedCode) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsApplying(true);
    try {
      await applyCoupon(trimmedCode);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
    setUserInputCode("");
  };

  return (
    <motion.div
      className="space-y-4 rounded-2xl p-5 sm:p-6"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f8fffe 100%)",
        border: "1px solid rgba(0, 128, 128, 0.15)",
        boxShadow: "0 8px 24px rgba(0, 128, 128, 0.08)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5" style={{ color: "#008080" }} />
          <label
            htmlFor="voucher"
            className="text-sm font-semibold"
            style={{ color: "#003366" }}
          >
            Do you have a voucher or gift card?
          </label>
        </div>

        <div className="relative">
          <input
            type="text"
            id="voucher"
            className="block w-full rounded-xl p-3 pl-10 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition-all"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 128, 128, 0.05) 0%, rgba(0, 51, 102, 0.05) 100%)",
              border: "1px solid rgba(0, 128, 128, 0.2)",
              color: "#334155",
            }}
            placeholder="Enter code here"
            value={userInputCode}
            onChange={(e) => setUserInputCode(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !isApplying) {
                handleApplyCoupon();
              }
            }}
            required
            disabled={isApplying}
          />
          <Tag
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "#008080" }}
          />
        </div>

        <motion.button
          type="button"
          className="flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
            boxShadow: "0 4px 14px rgba(0, 128, 128, 0.25)",
          }}
          whileHover={{ scale: isApplying ? 1 : 1.02 }}
          whileTap={{ scale: isApplying ? 1 : 0.98 }}
          onClick={handleApplyCoupon}
          disabled={isApplying}
        >
          {isApplying ? "Applying..." : "Apply Code"}
        </motion.button>
      </div>

      {isCouponApplied && coupon && (
        <div
          className="mt-4 p-4 rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 128, 128, 0.03) 0%, rgba(0, 51, 102, 0.03) 100%)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3
                className="text-sm font-semibold"
                style={{ color: "#003366" }}
              >
                Applied Coupon
              </h3>
              <p className="mt-1 text-sm" style={{ color: "#008080" }}>
                {coupon.code} - {coupon.discountPercentage}% off
              </p>
            </div>
            <motion.button
              type="button"
              className="p-2 rounded-lg transition-all"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRemoveCoupon}
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}

      {coupon && !isCouponApplied && (
        <div
          className="mt-4 p-4 rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 128, 128, 0.05) 0%, rgba(0, 51, 102, 0.05) 100%)",
            border: "1px solid rgba(0, 128, 128, 0.1)",
          }}
        >
          <h3 className="text-sm font-semibold" style={{ color: "#003366" }}>
            Your Available Coupon:
          </h3>
          <p className="mt-1 text-sm" style={{ color: "#008080" }}>
            {coupon.code} - {coupon.discountPercentage}% off
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default GiftCouponCard;
