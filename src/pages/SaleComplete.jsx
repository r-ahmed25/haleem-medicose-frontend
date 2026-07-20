import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Printer, FileDown, ShoppingBag } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import formatCurrency from "../lib/formatCurrency";
import { useProductStore } from "../hooks/useProductStore";
import { useCartStore } from "../hooks/useCartStore";

const SaleComplete = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [invoiceBlobUrl, setInvoiceBlobUrl] = useState(null);
  const [autoPrinted, setAutoPrinted] = useState(false);
  const printIframeRef = useRef(null);
  const fetchAllProducts = useProductStore((state) => state.fetchAllProducts);
  const refreshCartStockData = useCartStore((state) => state.refreshCartStockData);
  const triggerStockRefresh = useCartStore((state) => state.triggerStockRefresh);

  const { order, invoiceBase64 } = location.state || {};

  useEffect(() => {
    // Refresh products and stock data so everything reflects real-time inventory
    fetchAllProducts();
    refreshCartStockData();
    triggerStockRefresh();
    if (!order) {
      toast.error("No order data found");
      navigate("/cart");
      return;
    }

    if (invoiceBase64) {
      try {
        const binaryStr = atob(invoiceBase64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setInvoiceBlobUrl(url);
      } catch (err) {
        console.error("Failed to decode invoice:", err);
      }
    }
  }, [order, invoiceBase64, navigate]);

  // Auto-print invoice once blob URL is ready
  useEffect(() => {
    if (invoiceBlobUrl && !autoPrinted) {
      setAutoPrinted(true);
      setTimeout(() => {
        if (printIframeRef.current) {
          printIframeRef.current.focus();
          printIframeRef.current.contentWindow?.print();
        }
      }, 800);
    }
  }, [invoiceBlobUrl, autoPrinted]);

  const handlePrintInvoice = () => {
    if (!invoiceBlobUrl) {
      toast.error("Invoice not available yet");
      return;
    }
    if (printIframeRef.current) {
      printIframeRef.current.focus();
      printIframeRef.current.contentWindow?.print();
    } else {
      const w = window.open(invoiceBlobUrl, "_blank");
      if (w) {
        w.onload = () => setTimeout(() => w.print(), 500);
      } else {
        toast.error("Pop-up blocked. Please allow pop-ups to print.");
      }
    }
  };

  const handleDownloadInvoice = () => {
    if (!invoiceBlobUrl) {
      toast.error("Invoice not available yet");
      return;
    }
    const a = document.createElement("a");
    a.href = invoiceBlobUrl;
    a.download = `Invoice_${order?._id || "sale"}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Invoice downloaded!");
  };

  if (!order) return null;

  const totalAmount = order.totalAmount || 0;
  const orderItems = order.orderItems || [];
  const itemCount = orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const shortOrderId = order._id?.slice(-12).toUpperCase() || "N/A";

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{
        background: "linear-gradient(180deg, #f0fdf4 0%, #f8fffe 100%)",
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Success Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl p-6 sm:p-8 text-center mb-6"
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)",
            border: "2px solid rgba(46, 204, 113, 0.2)",
            boxShadow: "0 8px 32px rgba(46, 204, 113, 0.1)",
          }}
        >
          <div className="flex justify-center mb-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(46, 204, 113, 0.15) 0%, rgba(39, 174, 96, 0.15) 100%)",
              }}
            >
              <CheckCircle className="w-12 h-12" style={{ color: "#2ecc71" }} />
            </div>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{
              background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Sale Complete!
          </h1>
          <p className="text-base" style={{ color: "#475569" }}>
            The sale has been recorded and stock updated.
          </p>
          {/* Order ID prominently displayed */}
          <div
            className="mt-4 inline-block px-4 py-2 rounded-lg"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 128, 128, 0.08) 0%, rgba(0, 51, 102, 0.08) 100%)",
              border: "1px solid rgba(0, 128, 128, 0.15)",
            }}
          >
            <span className="text-xs font-medium" style={{ color: "#64748b" }}>
              Order ID for tracking
            </span>
            <p
              className="text-lg font-mono font-bold tracking-wider mt-0.5"
              style={{ color: "#008080" }}
            >
              #{shortOrderId}
            </p>
          </div>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
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
            Final Order Summary
          </h2>

          {/* Order Info */}
          <div
            className="space-y-2 mb-4 pb-4"
            style={{ borderBottom: "1px solid rgba(0, 128, 128, 0.1)" }}
          >
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: "#64748b" }}>Order ID</span>
              <span className="font-mono font-bold text-base" style={{ color: "#003366" }}>
                #{shortOrderId}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "#64748b" }}>Date</span>
              <span className="font-medium" style={{ color: "#334155" }}>
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "#64748b" }}>Items</span>
              <span className="font-medium" style={{ color: "#334155" }}>
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </span>
            </div>
            {order.customerName && (
              <div className="flex justify-between text-sm">
                <span style={{ color: "#64748b" }}>Customer</span>
                <span className="font-medium" style={{ color: "#334155" }}>
                  {order.customerName}
                  {order.customerPhone ? ` (${order.customerPhone})` : ""}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span style={{ color: "#64748b" }}>Salesperson</span>
              <span className="font-medium" style={{ color: "#334155" }}>
                {order.user?.fullName || "N/A"}
              </span>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2" style={{ color: "#003366" }}>
              Items
            </h3>
            <div className="space-y-2">
              {orderItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-2 px-3 rounded-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0, 128, 128, 0.03) 0%, rgba(0, 51, 102, 0.03) 100%)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#334155" }}>
                      {item.product?.name || item.name || `Item ${idx + 1}`}
                    </p>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      Qty: {item.quantity} × {formatCurrency(item.price?.toFixed(2) || "0.00")}
                    </p>
                  </div>
                  <span className="text-sm font-semibold ml-2" style={{ color: "#008080" }}>
                    {formatCurrency(((item.price || 0) * (item.quantity || 0)).toFixed(2))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 pt-4" style={{ borderTop: "1px solid rgba(0, 128, 128, 0.1)" }}>
            {order.couponApplied?.code && (
              <div className="flex justify-between text-sm">
                <span style={{ color: "#64748b" }}>Coupon ({order.couponApplied.code})</span>
                <span style={{ color: "#2ecc71" }}>
                  -{order.couponApplied.discountPercentage}%
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2">
              <span className="text-base font-bold" style={{ color: "#003366" }}>
                Grand Total
              </span>
              <span className="text-xl font-bold" style={{ color: "#008080" }}>
                {formatCurrency(totalAmount.toFixed(2))}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <button
            onClick={handlePrintInvoice}
            disabled={!invoiceBlobUrl}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-sm transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
              color: "white",
              boxShadow: "0 4px 14px rgba(0, 128, 128, 0.25)",
            }}
          >
            <Printer size={18} />
            Print Invoice
          </button>

          <button
            onClick={handleDownloadInvoice}
            disabled={!invoiceBlobUrl}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-sm transition-all hover:shadow-lg disabled:opacity-50"
            style={{
              background: "transparent",
              border: "2px solid #008080",
              color: "#008080",
            }}
          >
            <FileDown size={18} />
            Download PDF
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-sm transition-all hover:shadow-lg"
            style={{
              background: "transparent",
              border: "2px solid #003366",
              color: "#003366",
            }}
          >
            <ShoppingBag size={18} />
            New Sale
          </button>
        </motion.div>

        {/* Hidden iframe for auto-print */}
        {invoiceBlobUrl && (
          <iframe
            ref={printIframeRef}
            src={invoiceBlobUrl}
            title="Invoice"
            style={{
              position: "absolute",
              left: "-9999px",
              top: 0,
              width: 1,
              height: 1,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SaleComplete;
