import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaTimes,
  FaUser,
  FaSearch,
  FaFileUpload,
} from "react-icons/fa";
import {
  Upload,
  CheckCircle,
  XCircle,
  Home,
  Package,
  FileText,
  Phone,
  User,
  LayoutDashboard,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../hooks/useAuthStore";
import { useCartStore } from "../hooks/useCartStore";
import { formatLocation } from "../utils/locationFormatter";
import PrescriptionUploadForm from "./PrescriptionUploadForm"; // 👈 add this
import SearchSuggestions from "./SearchSuggestions";
import "../styles/NavBar.css";

const LOCATION_KEY = "hm_location";

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [locationLabels, setLocationLabels] = useState({
    full: "Detecting...",
    short: "Detecting...",
  });
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationObj, setLocationObj] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false); // 👈 modal state
  const [status, setStatus] = useState("idle");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { cart } = useCartStore();
  const isMobile = window.innerWidth <= 500;

  // location detection logic (same as your existing)
  useEffect(() => {
    const saved = localStorage.getItem(LOCATION_KEY);
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        setLocationObj(obj);
        return;
      } catch {}
    }
    detectAndSetLocation();
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("menu-open");
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.classList.remove("menu-open");
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("menu-open");
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [menuOpen]);

  // Dynamic menu width adjustment for mobile
  useEffect(() => {
    const adjustMenuWidth = () => {
      const drawer = menuRef.current;
      if (!drawer) return;

      const screenWidth = window.innerWidth;
      let maxWidth;

      if (screenWidth <= 360) {
        maxWidth = Math.min(screenWidth * 0.7, 240);
      } else if (screenWidth <= 480) {
        maxWidth = Math.min(screenWidth * 0.75, 260);
      } else {
        maxWidth = Math.min(screenWidth * 0.8, 280);
      }

      drawer.style.width = `${maxWidth}px`;
      drawer.style.maxWidth = `${maxWidth}px`;
    };

    adjustMenuWidth();
    window.addEventListener("resize", adjustMenuWidth);

    return () => window.removeEventListener("resize", adjustMenuWidth);
  }, []);

  async function reverseGeocode(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("Reverse geocode failed");
    return await res.json();
  }

  async function detectAndSetLocation() {
    if (!navigator.geolocation) {
      setLocationLabels({ full: "Location unavailable", short: "Unavailable" });
      return;
    }
    try {
      setIsDetecting(true);
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
        })
      );
      const { latitude, longitude } = pos.coords;
      const data = await reverseGeocode(latitude, longitude);
      const obj = {
        display_name: data.display_name,
        lat: latitude,
        lon: longitude,
        address: data.address || {},
      };
      localStorage.setItem(LOCATION_KEY, JSON.stringify(obj));
      setLocationObj(obj);
      window.dispatchEvent(
        new CustomEvent("hm:locationChanged", { detail: obj })
      );
      setLocationLabels(formatLocation(obj));
    } catch {
      setLocationLabels({ full: "Set location", short: "Set location" });
    } finally {
      setIsDetecting(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = String(search || "").trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setShowSuggestions(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleSuggestionSelect = (product) => {
    navigate(`/product/${product.id}`);
    setShowSuggestions(false);
    setSearch("");
  };

  const handleCloseSuggestions = () => {
    setShowSuggestions(false);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <header
        className="navbar relative"
        role="banner"
        style={{
          background:
            "linear-gradient(135deg, rgba(0, 128, 128, 0.95) 0%, rgba(0, 51, 102, 0.95) 50%, rgba(0, 100, 100, 0.95) 100%)",
          backdropFilter: "blur(10px)",
          boxShadow:
            "0 25px 50px rgba(0, 128, 128, 0.25), 0 15px 35px rgba(0, 51, 102, 0.2)",
        }}
      >
        {/* Decorative gradient overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(46, 204, 113, 0.15) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10">
          <div className="nav-top">
            <div className="nav-left-top">
              <button
                className="user-placeholder"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((v) => !v)}
                title="Account & menu"
              >
                <FaUser />
              </button>

              <div
                className="deliver-to"
                onClick={() => navigate("/location")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate("/location")}
                title="Change delivery location"
              >
                <div className="deliver-label">Deliver to</div>
                <div className="deliver-address">
                  {isDetecting
                    ? "Detecting..."
                    : locationObj
                    ? formatLocation(locationObj, isMobile)
                    : "Set location"}
                  <span className="chev">›</span>
                </div>
              </div>
            </div>

            <div className="nav-right-top">
              {user && (
                <Link
                  to={"/cart"}
                  className="relative group text-white/90 hover:text-emerald-400 transition duration-300 px-2 py-1 rounded-md hover:bg-white/5 flex items-center gap-1 min-w-0"
                >
                  <FaShoppingCart
                    className="group-hover:text-emerald-400 flex-shrink-0"
                    size={18}
                  />
                  <span className="hidden sm:inline text-sm whitespace-nowrap">
                    Cart
                  </span>
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -left-2 bg-emerald-500 text-white rounded-full px-1.5 py-0.5 text-xs min-w-[18px] h-[18px] flex items-center justify-center border border-white/20 shadow-sm">
                      {cart.length > 99 ? "99+" : cart.length}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>

          {/* Search row */}
          <div className="nav-search-row">
            <div
              className="search-container"
              style={{ position: "relative", width: "100%", maxWidth: "920px" }}
            >
              <form
                className="search-form"
                onSubmit={handleSearchSubmit}
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  borderRadius: "40px",
                  boxShadow: "0 10px 28px rgba(0, 0, 0, 0.1)",
                }}
              >
                <button
                  type="button"
                  className="search-icon-left"
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                  }}
                >
                  <FaSearch />
                </button>
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search for Medicines..."
                  value={search}
                  onChange={handleSearchChange}
                  onFocus={() => search.length > 0 && setShowSuggestions(true)}
                  style={{
                    color: "white",
                    background: "transparent",
                  }}
                />
                {/* File Upload icon opens modal */}
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)} // 👈 open modal
                  className="camera-icon fileupload text-sm sm:text-2xl cursor-pointer flex items-center gap-1 px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
                  title="Upload Prescription"
                  style={{
                    color: "rgba(46, 204, 113, 0.95)",
                  }}
                >
                  <Upload size={16} />
                  <span className="text-emerald-400 font-medium hidden sm:inline">
                    Upload
                  </span>
                </button>
              </form>

              {/* Search Suggestions */}
              <SearchSuggestions
                query={search}
                onSelect={handleSuggestionSelect}
                onClose={handleCloseSuggestions}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu with Framer Motion - moved outside header for proper z-index stacking */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="menu-backdrop"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.nav
              ref={menuRef}
              className="mobile-menu-drawer"
              initial={{ opacity: 0, x: "-50%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-50%" }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 200,
                mass: 0.8,
              }}
              style={{
                background:
                  "linear-gradient(135deg, rgba(0, 128, 128, 0.95) 0%, rgba(0, 51, 102, 0.95) 50%, rgba(0, 100, 100, 0.95) 100%)",
                backdropFilter: "blur(15px)",
                boxShadow:
                  "0 25px 50px rgba(0, 128, 128, 0.3), 0 15px 35px rgba(0, 51, 102, 0.25)",
                zIndex: 99999,
                position: "fixed",
                top: 0,
                left: 0,
                height: "100vh",
                width: "280px",
              }}
            >
              <div className="menu-header">
                <button
                  className="close-btn"
                  onClick={() => setMenuOpen(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <motion.ul
                className="mobile-menu-list"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.2,
                    },
                  },
                }}
              >
                <motion.li
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className="menu-item-with-icon"
                  >
                    <span>Home</span>
                    <Home size={16} className="menu-item-icon" />
                  </Link>
                </motion.li>
                <motion.li
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  {user?.role !== "admin" && (
                    <Link
                      to="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="menu-item-with-icon"
                    >
                      <span>My Orders</span>
                      <Package size={16} className="menu-item-icon" />
                    </Link>
                  )}
                </motion.li>
                <motion.li
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  {user?.role !== "admin" && (
                    <Link
                      to="/prescriptions"
                      onClick={() => setMenuOpen(false)}
                      className="menu-item-with-icon"
                    >
                      <span>My Prescriptions</span>
                      <FileText size={16} className="menu-item-icon" />
                    </Link>
                  )}
                </motion.li>
                <motion.li
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  {user?.role !== "admin" && (
                    <Link
                      to="/contact"
                      onClick={() => setMenuOpen(false)}
                      className="menu-item-with-icon"
                    >
                      <span>Contact</span>
                      <Phone size={16} className="menu-item-icon" />
                    </Link>
                  )}
                </motion.li>
                <motion.li
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <Link
                    to="/update-profile"
                    onClick={() => setMenuOpen(false)}
                    className="menu-item-with-icon"
                  >
                    <span>Account</span>
                    <User size={16} className="menu-item-icon" />
                  </Link>
                </motion.li>
                <motion.li
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  {user?.role === "admin" && (
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="menu-item-with-icon"
                    >
                      <span>Dashboard</span>
                      <LayoutDashboard size={16} className="menu-item-icon" />
                    </Link>
                  )}
                </motion.li>
                <motion.li
                  variants={{
                    hidden: { opacity: 0, x: -20, scale: 0.9 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      transition: {
                        type: "spring",
                        damping: 15,
                        stiffness: 300,
                        delay: 0.6,
                      },
                    },
                  }}
                >
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
                    whileHover={{
                      scale: 1.02,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      },
                    }}
                    whileTap={{
                      scale: 0.98,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      },
                    }}
                  >
                    <LogOut className="h-4 w-4 sm:h-5 sm:w-5" /> Logout
                  </button>
                </motion.li>
              </motion.ul>
              
              {/* Company Info Footer */}
              <div className="mt-auto pt-8 pb-6 px-4 border-t border-white/10">
                <div className="text-center">
                  <p className="text-white/70 text-xs font-medium">
                    Powered by
                  </p>
                  <p className="text-emerald-400 text-sm font-bold">
                    CuttingEdge Enterprises
                  </p>
                  <p className="text-white/50 text-xs mt-1">
                    Version 1.0
                  </p>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* 👇 Prescription Upload Modal */}
      {showUploadModal && (
        <PrescriptionUploadForm
          onClose={() => setShowUploadModal(false)}
          setStatus={setStatus}
        />
      )}
    </>
  );
}
