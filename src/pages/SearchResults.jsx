// src/pages/SearchResults.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import products from "../data/products";

export  function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const inputRef = useRef(null);

  // Autofocus the search input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep query synced if URL changes (e.g., user navigated here via Navbar)
  useEffect(() => {
    const qFromUrl = searchParams.get("q") || "";
    if (qFromUrl !== query) setQuery(qFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Debounce updating the URL (so fast typing doesn't spam history)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (query && query.trim()) setSearchParams({ q: query.trim() });
      else setSearchParams({});
    }, 300);
    return () => clearTimeout(handler);
    // keep setSearchParams stable; do not include it in deps to avoid re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Defensive normalized query for filtering
  const normQuery = String(query || "").trim().toLowerCase();

  // Filter products (defensive against missing fields)
  const filtered = useMemo(() => {
    // If no query, return all products (change to [] if you prefer empty)
    if (!normQuery) return products;

    return products.filter((p) => {
      const name = (p.name || "").toString().toLowerCase();
      const desc = (p.description || "").toString().toLowerCase();
      const cat = (p.category || "").toString().toLowerCase();

      return (
        name.includes(normQuery) ||
        desc.includes(normQuery) ||
        cat.includes(normQuery)
      );
    });
  }, [normQuery]);

  return (
    <div className="page search-results" style={{ padding: "1.5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ marginBottom: 8 }}>
          Search Results {normQuery ? <>for <em>"{normQuery}"</em></> : null}
        </h2>

        <div style={{ margin: "0 0 1rem 0" }}>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicines, categories, descriptions..."
            className="search-box"
            style={{
              width: "100%",
              maxWidth: 720,
              padding: "10px 12px",
              borderRadius: 20,
              border: "1px solid rgba(0,0,0,0.15)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div
          className="product-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {filtered.length > 0 ? (
            filtered.map((product) => {
              const id = product._id ?? product.id ?? product.name;
              return (
                <div
                  key={id}
                  className="product-card"
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <Link
                    to={`/product/${product._id ?? product.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div style={{ width: "100%", height: 140, overflow: "hidden", borderRadius: 6 }}>
                      <img
                        src={product.thumbnail || product.image || ""}
                        alt={product.name || "Product image"}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = product.image || "";
                        }}
                      />
                    </div>

                    <h3 style={{ margin: "8px 0 4px", fontSize: "1rem" }}>
                      {product.name || "Unnamed product"}
                    </h3>

                    <p style={{ margin: 0, color: "#555", fontSize: 13, minHeight: 40 }}>
                      {product.description ? (product.description.length > 80 ? product.description.slice(0, 80) + "…" : product.description) : "No description"}
                    </p>

                    <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: "#111" }}>₹{product.price ?? "—"}</strong>
                      <small style={{ color: product.stock > 0 ? "#2a9d8f" : "#e63946" }}>
                        {typeof product.stock === "number" ? (product.stock > 0 ? `${product.stock} in stock` : "Out of stock") : product.stock}
                      </small>
                    </div>
                  </Link>
                </div>
              );
            })
          ) : (
            <p>No products match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchResults;