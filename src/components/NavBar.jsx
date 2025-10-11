// src/components/NavBar.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaTimes, FaUser, FaSearch, FaCamera } from "react-icons/fa";
import { formatLocation } from "../utils/locationFormatter";

import "../styles/NavBar.css";
import { useAuthStore } from "../hooks/useAuthStore";
import { LogOut } from "lucide-react";

const LOCATION_KEY = "hm_location";

async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lon)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Reverse geocode failed");
  return await res.json();
}

// helper → return both labels
function composeLabels(locObj) {
  if (!locObj) return { full: "Set location", short: "Set location" };

  let full = "";
  if (locObj.display_name) {
    full = locObj.display_name;
  } else if (locObj.addressLine1) {
    full = `${locObj.addressLine1}${locObj.city ? ", " + locObj.city : ""}${
      locObj.pincode ? " - " + locObj.pincode : ""
    }`;
  } else if (locObj.city || locObj.pincode) {
    full = `${locObj.city || ""}${locObj.pincode ? " - " + locObj.pincode : ""}`.trim();
  } else if (locObj.lat && locObj.lon) {
    full = `Lat ${Number(locObj.lat).toFixed(3)}, Lon ${Number(locObj.lon).toFixed(3)}`;
  } else {
    full = "Set location";
  }

  let short = "";
  if (locObj.city || locObj.pincode) {
    short = `${locObj.city || ""}${locObj.pincode ? " - " + locObj.pincode : ""}`.trim();
  } else {
    short = full.split(",")[0];
  }

  return { full, short };
}

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [locationLabels, setLocationLabels] = useState({ full: "Detecting...", short: "Detecting..." });
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationObj, setLocationObj] = useState(null);

  const menuRef = useRef(null);
  const navigate = useNavigate();
  const  {user, logout} = useAuthStore()
  const isMobile = window.innerWidth <= 500; 
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

async function detectAndSetLocation() {
  // ... after reverse geocode
  const obj = {
    display_name: data.display_name,
    lat: latitude,
    lon: longitude,
    address: data.address || {},
  };
  localStorage.setItem(LOCATION_KEY, JSON.stringify(obj));
  setLocationObj(obj);
}



  useEffect(() => {
    const handler = (e) => {
      const payload = e?.detail;
      if (payload) {
        setLocationLabels(composeLabels(payload));
      } else {
        const saved = localStorage.getItem(LOCATION_KEY);
        if (saved) {
          try {
            setLocationLabels(composeLabels(JSON.parse(saved)));
          } catch {}
        }
      }
    };
    window.addEventListener("hm:locationChanged", handler);

    const storageHandler = (ev) => {
      if (ev.key === LOCATION_KEY && ev.newValue) {
        try {
          setLocationLabels(composeLabels(JSON.parse(ev.newValue)));
        } catch {}
      }
    };
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener("hm:locationChanged", handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  async function detectAndSetLocation() {
    if (!navigator.geolocation) {
      setLocationLabels({ full: "Location unavailable", short: "Unavailable" });
      return;
    }
    try {
      setIsDetecting(true);
      setLocationLabels({ full: "Detecting...", short: "Detecting..." });
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      const { latitude, longitude } = pos.coords;
      try {
        const data = await reverseGeocode(latitude, longitude);
        const obj = {
          display_name: data.display_name,
          lat: latitude,
          lon: longitude,
          address: data.address || {},
        };
        localStorage.setItem(LOCATION_KEY, JSON.stringify(obj));
        setLocationObj(obj);   // <-- store full object
        // setLocationLabel(composeShortLabel(obj));
        window.dispatchEvent(new CustomEvent("hm:locationChanged", { detail: obj }));
        setLocationLabels(composeLabels(obj));
      } catch {
        setLocationLabels({ full: `Lat ${latitude.toFixed(3)}, Lon ${longitude.toFixed(3)}`, short: "Coords" });
      }
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
    setMenuOpen(false)
    navigate("/");
  };    

  return (
    <header className="navbar" role="banner">
      {/* Top row */}
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
  {isDetecting ? "Detecting..." : formatLocation(locationObj, isMobile)}
  <span className="chev">›</span>
</div>


          </div>
        </div>

        <div className="nav-right-top">
          <button className="icon-btn cart-btn" aria-label="Open cart" onClick={() => navigate("/cart")}>
            <FaShoppingCart />
          </button>
        </div>
      </div>

      {/* Search row */}
      <div className="nav-search-row">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <button type="button" className="search-icon-left"><FaSearch /></button>
          <input
            className="search-input"
            type="text"
            placeholder="Search for Medicines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" className="camera-icon"><FaCamera /></button>
        </form>
      </div>

      {/* Slide-in menu drawer */}
      <nav ref={menuRef} className={`mobile-menu-drawer ${menuOpen ? "open" : ""}`}>
        <div className="menu-header">
          <button className="close-btn" onClick={() => setMenuOpen(false)}><FaTimes /></button>
        </div>
        <ul className="mobile-menu-list">
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
          <li><Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link></li>
          <li><Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link></li>
          <li><Link to="/account" onClick={() => setMenuOpen(false)}>Account</Link></li>
          <li><button
  type="button"
  onClick={handleLogout}
  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
>


 <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />

  Logout
</button>
</li>
        </ul>
      </nav>

      {menuOpen && <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />}
    </header>
  );
}
