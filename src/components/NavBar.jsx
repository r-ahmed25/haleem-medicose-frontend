// src/components/NavBar.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaTimes,
  FaUser,
  FaSearch,
  FaFileUpload,
} from "react-icons/fa";
import { LogOut } from "lucide-react";
import { useAuthStore } from "../hooks/useAuthStore";
import { useCartStore } from "../hooks/useCartStore";
import { formatLocation } from "../utils/locationFormatter";
import PrescriptionUploadForm from "./PrescriptionUploadForm"; // 👈 add this
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
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <header className="navbar" role="banner">
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
                className="relative group text-gray-300 hover:text-emerald-400 transition duration-300"
              >
                <FaShoppingCart
                  className="inline-block mr-1 group-hover:text-emerald-400"
                  size={20}
                />
                <span className="hidden sm:inline">Cart</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -left-2 bg-emerald-500 text-white rounded-full px-2 py-0.5 text-xs">
                    {cart.length}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>

        {/* Search row */}
        <div className="nav-search-row">
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <button type="button" className="search-icon-left">
              <FaSearch />
            </button>
            <input
              className="search-input"
              type="text"
              placeholder="Search for Medicines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {/* File Upload icon opens modal */}
            <button
              type="button"
              onClick={() => setShowUploadModal(true)} // 👈 open modal
              className="camera-icon fileupload text-sm sm:text-2xl cursor-pointer"
              title="Upload Prescription"
            >
              <FaFileUpload />
            </button>
          </form>
        </div>

        {/* mobile menu (unchanged) */}
        <nav
          ref={menuRef}
          className={`mobile-menu-drawer ${menuOpen ? "open" : ""}`}
        >
          <div className="menu-header">
            {" "}
            <button className="close-btn" onClick={() => setMenuOpen(false)}>
              <FaTimes />
            </button>{" "}
          </div>{" "}
          <ul className="mobile-menu-list">
            {" "}
            <li>
              <Link to="/" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
            </li>{" "}
           
            <li>
              {user?.role !== "admin" && (
                <Link to="/orders" onClick={() => setMenuOpen(false)}>
                  My Orders
                </Link>
              )}
            </li>{" "}
           
            <li>
              {user?.role !== "admin" && (
                <Link to="/prescriptions" onClick={() => setMenuOpen(false)}>
                  My Prescriptions
                </Link>
              )}
            </li>{" "}
              <li>
              {user?.role !== "admin" && (
                <Link to="/contact" onClick={() => setMenuOpen(false)}>
                  Contact
                </Link>
              )}
            </li>{" "}
            <li>
              <Link to="/update-profile" onClick={() => setMenuOpen(false)}>
                Account
              </Link>
            </li>{" "}
            <li>
              {user?.role === "admin" && (
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
              )}
            </li>{" "}
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
              >
                {" "}
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" /> Logout{" "}
              </button>{" "}
            </li>{" "}
          </ul>
        </nav>
        {menuOpen && (
          <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
        )}
      </header>

      {/* 👇 Prescription Upload Modal */}
      {showUploadModal && (
        <PrescriptionUploadForm onClose={() => setShowUploadModal(false)} />
      )}
    </>
  );
}
