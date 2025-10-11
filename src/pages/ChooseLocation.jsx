// src/pages/ChooseLocation.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/ChooseLocation.css";

const LOCATION_KEY = "hm_location";

async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lon)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Reverse geocode failed");
  return await res.json();
}

export default function ChooseLocation() {
  const navigate = useNavigate();
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    altPhone: "",
    lat: null,
    lon: null,
    display_name: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem(LOCATION_KEY);
    if (saved) {
      try {
        setForm((f) => ({ ...f, ...JSON.parse(saved) }));
      } catch {}
    }
  }, []);

  function updateField(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMsg("Geolocation not available in this browser.");
      return;
    }
    setMsg("");
    setLoadingGeo(true);
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      const { latitude, longitude } = pos.coords;
      // reverse geocode
      try {
        const data = await reverseGeocode(latitude, longitude);
        // fill form with pieces we can
        const addr = data.address || {};
        updateField("lat", latitude);
        updateField("lon", longitude);
        updateField("display_name", data.display_name || "");
        updateField("addressLine1", addr.road ? `${addr.road} ${addr.house_number || ""}`.trim() : "");
        updateField("city", addr.city || addr.town || addr.village || "");
        updateField("state", addr.state || "");
        updateField("pincode", addr.postcode || "");
        setMsg("Filled using current location. Edit if needed and Save.");
      } catch (err) {
        updateField("lat", latitude);
        updateField("lon", longitude);
        setMsg("Got coordinates. Unable to reverse-geocode. Please enter address manually.");
      }
    } catch (err) {
      setMsg("Could not get current location (permission denied or timeout).");
    } finally {
      setLoadingGeo(false);
    }
  }

  function validate() {
    if (!form.addressLine1 || !form.city || !form.pincode || !form.phone) {
      return "Please enter at least Address line 1, City, Pincode and Phone.";
    }
    if (!/^\d{4,6}$/.test(form.pincode)) {
      return "Enter a valid pincode / postal code.";
    }
    if (!/^\d{7,15}$/.test(form.phone.replace(/\s+/g, ""))) {
      return "Enter a valid phone number.";
    }
    return null;
  }

  function handleSave(e) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setMsg(err);
      return;
    }
    // save to localStorage
    const toSave = { ...form };
    localStorage.setItem(LOCATION_KEY, JSON.stringify(toSave));
    // notify NavBar and other tabs
    window.dispatchEvent(new CustomEvent("hm:locationChanged", { detail: toSave }));
    setMsg("Location saved.");
    // navigate home
    navigate("/");
  }

  return (
  <main className="choose-location-page">
    <section className="choose-card">
      <h2>Choose delivery location</h2>
      <p className="lead">You can use your current location or enter an address manually.</p>

      <div className="top-actions">
        <button className="btn btn-primary" onClick={useCurrentLocation}>
          {loadingGeo ? <span className="spinner" /> : "Use current location"}
        </button>
        <Link to="/" className="link-plain">Back to Home</Link>
      </div>

      {msg && <div className="form-message">{msg}</div>}

      <form className="location-form" onSubmit={handleSave}>
        <div className="form-group col-12">
          <label>Address line 1 *</label>
          <input value={form.addressLine1} onChange={(e)=>updateField("addressLine1", e.target.value)} />
        </div>

        <div className="form-group col-12">
          <label>Address line 2</label>
          <input value={form.addressLine2} onChange={(e)=>updateField("addressLine2", e.target.value)} />
        </div>

        <div className="form-group col-6">
          <label>City *</label>
          <input value={form.city} onChange={(e)=>updateField("city", e.target.value)} />
        </div>

        <div className="form-group col-6">
          <label>State</label>
          <input value={form.state} onChange={(e)=>updateField("state", e.target.value)} />
        </div>

        <div className="form-group col-6">
          <label>Pincode *</label>
          <input value={form.pincode} onChange={(e)=>updateField("pincode", e.target.value)} />
        </div>

        <div className="form-group col-6">
          <label>Phone *</label>
          <input value={form.phone} onChange={(e)=>updateField("phone", e.target.value)} />
        </div>

        <div className="form-group col-12">
          <label>Alternate phone</label>
          <input value={form.altPhone} onChange={(e)=>updateField("altPhone", e.target.value)} />
        </div>

        <div className="form-group col-12">
          <label>Notes / landmark</label>
          <input value={form.notes} onChange={(e)=>updateField("notes", e.target.value)} />
        </div>

        <div className="hr" />

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Save Location</button>
          <Link to="/" className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </section>
  </main>
);
}
