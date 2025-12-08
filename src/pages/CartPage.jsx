import { Link } from "react-router-dom";
import { useCartStore } from "../hooks/useCartStore";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, RefreshCw } from "lucide-react";
import CartItem from "../components/CartItem";
import OrderSummary from "../components/OrderSummary";
import PeopleAlsoBought from "../components/PeopleAlsoBought";
import GiftCouponCard from "../components/GiftCouponCard";

const CartPage = () => {
  const { cart, refreshCartStockData, getCartItems } = useCartStore();

  // Refresh stock data every 30 seconds when cart has items
  useEffect(() => {
    if (cart.length > 0) {
      // Initial stock check
      refreshCartStockData();

      // Set up periodic refresh
      const interval = setInterval(() => {
        refreshCartStockData();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [cart.length, refreshCartStockData]);

  // Refresh cart data on page load
  useEffect(() => {
    getCartItems();
  }, [getCartItems]);

  return (
    <div
      className="py-8 md:py-16 min-h-screen"
      style={{
        background: "linear-gradient(180deg, #f8fffe 0%, #f0f9f7 100%)",
      }}
    >
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{
              background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Shopping Cart
          </h1>

          {cart.length > 0 && (
            <button
              onClick={() => refreshCartStockData()}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-lg transition-all hover:shadow-md"
              style={{
                background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
              }}
              title="Refresh stock information"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Refresh Stock</span>
            </button>
          )}
        </div>

        <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
          <motion.div
            className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {cart.length === 0 ? (
              <EmptyCartUI />
            ) : (
              <>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <CartItem key={item._id} item={item} />
                  ))}
                </div>

                {/* Stock Status Summary */}
                <StockStatusSummary cart={cart} />
                {cart.length > 0 && <PeopleAlsoBought />}
              </>
            )}
          </motion.div>

          {cart.length > 0 && (
            <motion.div
              className="mx-auto mt-6 max-w-4xl flex-1 space-y-4 lg:mt-0 lg:w-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <OrderSummary />
              <GiftCouponCard />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stock Status Summary Component
const StockStatusSummary = ({ cart }) => {
  const itemsWithStockIssues = cart.filter(
    (item) =>
      item.availableStock !== null && item.availableStock < item.quantity
  );

  if (itemsWithStockIssues.length === 0) {
    return (
      <motion.div
        className="mt-6 p-4 rounded-xl border border-green-200 bg-green-50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">
            All items are in stock ✓
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mt-6 p-4 rounded-xl border border-orange-200 bg-orange-50"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-2">
        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
        <div>
          <h3 className="text-sm font-medium text-orange-800 mb-2">
            Stock Issues Detected
          </h3>
          <div className="space-y-1">
            {itemsWithStockIssues.map((item) => (
              <div key={item.cartItemId} className="text-sm text-orange-700">
                • {item.name}: {item.availableStock} available (you have{" "}
                {item.quantity})
              </div>
            ))}
          </div>
          <p className="text-xs text-orange-600 mt-2">
            Please adjust quantities to match available stock.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default CartPage;

const EmptyCartUI = () => (
  <motion.div
    className="flex flex-col items-center justify-center space-y-4 py-16 rounded-2xl"
    style={{
      background: "linear-gradient(180deg, #ffffff 0%, #f8fffe 100%)",
      border: "1px solid rgba(0, 128, 128, 0.1)",
      boxShadow: "0 4px 20px rgba(0, 128, 128, 0.08)",
    }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div
      className="w-24 h-24 rounded-full flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, rgba(0, 128, 128, 0.1) 0%, rgba(0, 51, 102, 0.1) 100%)",
      }}
    >
      <ShoppingCart className="h-12 w-12" style={{ color: "#008080" }} />
    </div>
    <h3
      className="text-2xl font-bold"
      style={{
        background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      Your cart is empty
    </h3>
    <p style={{ color: "#64748b" }}>
      Looks like you haven't added anything to your cart yet.
    </p>
    <Link
      className="mt-4 rounded-xl px-8 py-3 text-white font-semibold transition-all hover:shadow-lg"
      style={{
        background: "linear-gradient(135deg, #008080 0%, #003366 100%)",
        boxShadow: "0 4px 14px rgba(0, 128, 128, 0.25)",
      }}
      to="/"
    >
      Start Shopping
    </Link>
  </motion.div>
);
