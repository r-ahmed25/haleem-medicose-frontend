// src/pages/ChooseLocation.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/ChooseLocation.css";
import api from "../lib/axios"; // axios instance with withCredentials:true

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
  const location = useLocation();
  const state = location.state || {};
  const fromCheckout = !!state.fromCheckout;
  const initialPending = state.pendingPayment || null;

  // also support query param fallback: /location?pendingOrder=<razorpayOrderId>
  const searchParams = new URLSearchParams(location.search);
  const pendingOrderId = searchParams.get("pendingOrder") || null;

  const [loadingGeo, setLoadingGeo] = useState(false);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(initialPending);
  const [loadingPending, setLoadingPending] = useState(false);

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
    notes: ""
  });

  useEffect(() => {
    // Prefill from localStorage (NavBar uses this)
    const saved = localStorage.getItem(LOCATION_KEY);
    if (saved) {
      try {
        setForm((f) => ({ ...f, ...JSON.parse(saved) }));
      } catch {}
    }

    // Fetch saved addresses from server (if logged in)
    (async () => {
      try {
        const res = await api.get("/addresses"); // adjust route if different
        if (res?.data?.addresses && res.data.addresses.length > 0) {
          const a = res.data.addresses[0];
          setForm((s) => ({ ...s, ...a }));
        }
      } catch (err) {
        // ignore: may be not logged in
      }
    })();
  }, []);

  useEffect(() => {
    // If pendingPayment not provided via navigation state, try to fetch it using pendingOrderId
    if (!pendingPayment && pendingOrderId) {
      (async () => {
        try {
          setLoadingPending(true);
          const res = await api.get(`/payment/pending/${encodeURIComponent(pendingOrderId)}`);
          if (res?.data?.success && res.data.pending) {
            const p = res.data.pending;
            // normalize pending fields if stored differently (cartSnapshot -> orderItems)
            const normalized = {
              payment_id: p.razorpayPaymentId || p.payment_id,
              order_id: p.razorpayOrderId || p.order_id,
              signature: p.signature,
              orderItems: p.cartSnapshot || p.orderItems || [],
              totalAmount: p.totalAmount,
              couponApplied: p.couponApplied || null
            };
            setPendingPayment(normalized);
            // optionally prefill form with pendingAddress if server had one
            if (p.shippingAddress) setForm((s) => ({ ...s, ...p.shippingAddress }));
          }
        } catch (err) {
          // no pending found or auth issue — user may need to re-do checkout
          console.warn("No pending payment fetched", err);
        } finally {
          setLoadingPending(false);
        }
      })();
    }
  }, [pendingOrderId, pendingPayment]);

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
      try {
        const data = await reverseGeocode(latitude, longitude);
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

  async function handleSave(e) {
    e?.preventDefault?.();
    const err = validate();
    if (err) {
      setMsg(err);
      return;
    }
    setSaving(true);

    // Save to localStorage (for NavBar and cross-tabs)
    const toSave = { ...form };
    localStorage.setItem(LOCATION_KEY, JSON.stringify(toSave));
    window.dispatchEvent(new CustomEvent("hm:locationChanged", { detail: toSave }));

    try {
      // Persist to server for logged-in user
      try {
        await api.post("/addresses", toSave);
      } catch (err) {
        console.warn("Failed to save address to server:", err?.response?.data || err);
      }

      // If triggered from checkout with pendingPayment, finish verification
      if (fromCheckout) {
        // ensure we have pendingPayment; if not but we have pendingOrderId, try fetch again
        let pending = pendingPayment;
        if (!pending && pendingOrderId) {
          try {
            const r = await api.get(`/payment/pending/${encodeURIComponent(pendingOrderId)}`);
            if (r?.data?.success && r.data.pending) {
              const p = r.data.pending;
              pending = {
                payment_id: p.razorpayPaymentId || p.payment_id,
                order_id: p.razorpayOrderId || p.order_id,
                signature: p.signature,
                orderItems: p.cartSnapshot || p.orderItems || [],
                totalAmount: p.totalAmount,
                couponApplied: p.couponApplied || null
              };
              setPendingPayment(pending);
            }
          } catch (err) {
            console.warn("Failed to fetch pending payment during save", err);
          }
        }

        if (!pending) {
          // if still no pending, we can't finalize — ask user to retry checkout
          setMsg("Unable to resume checkout. Please try again from the cart.");
          return;
        }

        try {
          const payload = {
            payment_id: pending.payment_id,
            order_id: pending.order_id,
            signature: pending.signature,
            orderItems: pending.orderItems,
            totalAmount: pending.totalAmount,
            couponApplied: pending.couponApplied,
            shippingAddress: toSave
          };

          const res = await api.post("/payment/verifypayment", payload);
          if (res?.data?.success) {
            // clear front-end cart
            window.dispatchEvent(new CustomEvent("hm:cartClearRequested"));
            navigate(`/purchase-success?orderId=${res.data.orderId || ""}`);
            return;
          } else if (res?.data?.needs_address) {
            // Should not happen because we sent shippingAddress; show message
            setMsg("Server still needs a valid address. Please check your address fields.");
            return;
          } else {
            // generic failure
            console.error("Finalization failed:", res?.data);
            navigate("/purchase-cancel");
            return;
          }
        } catch (err) {
          console.error("Failed to finalize payment with address:", err);
          // If server responds with needs_address in error body, show appropriate message
          const serverData = err?.response?.data;
          if (serverData?.needs_address) {
            setMsg("Server says address still needed. Please review and try again.");
            return;
          }
          navigate("/purchase-cancel");
          return;
        }
      }

      // Normal save flow (not from checkout)
      setMsg("Location saved.");
      navigate("/");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="choose-location-page">
      <section className="choose-card">
        <h2>Choose delivery location</h2>
        <p className="lead">You can use your current location or enter an address manually.</p>

        {loadingPending && <div className="info">Loading pending checkout details...</div>}
        {msg && <div className="form-message">{msg}</div>}

        <div className="top-actions">
          <button className="btn btn-primary" onClick={useCurrentLocation}>
            {loadingGeo ? <span className="spinner" /> : "Use current location"}
          </button>
          <Link to="/" className="link-plain">Back to Home</Link>
        </div>

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
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : fromCheckout ? "Save & Complete Order" : "Save Location"}
            </button>
            <Link to="/" className="btn btn-ghost">Cancel</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
