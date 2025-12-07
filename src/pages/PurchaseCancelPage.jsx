import { XCircle, ArrowLeft, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const PurchaseCancelPage = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background: "linear-gradient(180deg, #fef8f8 0%, #fdf2f2 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full rounded-2xl shadow-2xl overflow-hidden relative z-10"
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #fffbfb 100%)",
          border: "1px solid rgba(239, 68, 68, 0.15)",
        }}
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)",
              }}
            >
              <XCircle className="w-12 h-12" style={{ color: "#ef4444" }} />
            </div>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-center mb-2"
            style={{ color: "#dc2626" }}
          >
            Purchase Cancelled
          </h1>
          <p className="text-center mb-6" style={{ color: "#64748b" }}>
            Your order has been cancelled. No charges have been made.
          </p>

          <div
            className="rounded-xl p-4 mb-6"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 128, 128, 0.05) 0%, rgba(0, 51, 102, 0.05) 100%)",
              border: "1px solid rgba(0, 128, 128, 0.1)",
            }}
          >
            <div className="flex items-start gap-3">
              <MessageCircle
                className="w-5 h-5 mt-0.5 flex-shrink-0"
                style={{ color: "#008080" }}
              />
              <p className="text-sm" style={{ color: "#475569" }}>
                If you encountered any issues during the checkout process,
                please don't hesitate to contact our support team.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to={"/contact"}
              className="w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center hover:shadow-lg"
              style={{
                background: "transparent",
                border: "2px solid #008080",
                color: "#008080",
              }}
            >
              <MessageCircle className="mr-2" size={18} />
              Contact Support
            </Link>
            <Link
              to={"/"}
              className="w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center text-white hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
                boxShadow: "0 4px 14px rgba(0, 128, 128, 0.25)",
              }}
            >
              <ArrowLeft className="mr-2" size={18} />
              Return to Shop
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PurchaseCancelPage;
