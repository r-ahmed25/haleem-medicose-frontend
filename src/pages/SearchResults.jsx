// src/pages/SearchResults.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Home, Search } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useProductStore } from "../hooks/useProductStore";

export function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const inputRef = useRef(null);
  const { products, loading, error, fetchAllProducts } = useProductStore();

  // Autofocus the search input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch products from backend on component mount
  useEffect(() => {
    if (products.length === 0 && !loading) {
      fetchAllProducts();
    }
  }, [products.length, loading, fetchAllProducts]);

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
  const normQuery = String(query || "")
    .trim()
    .toLowerCase();

  // Filter products from backend data (defensive against missing fields)
  const filtered = useMemo(() => {
    // If no query, return all products from backend
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
  }, [normQuery, products]);

  return (
    <div
      className="page search-results min-h-screen bg-gray-50"
      style={{ padding: "1.5rem" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-700 hover:text-emerald-600"
          >
            <Home size={20} />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Search Results{" "}
            {normQuery ? (
              <>
                for <em className="text-emerald-600">"{normQuery}"</em>
              </>
            ) : null}
          </h1>
        </div>

        {/* Search input */}
        <div style={{ margin: "0 0 2rem 0" }}>
          <div className="relative max-w-2xl">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search medicines, categories, descriptions..."
              className="search-box w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              style={{
                background: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            />
          </div>
        </div>

        {/* Results */}
        {filtered.length > 0 ? (
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                Found {filtered.length} result{filtered.length !== 1 ? "s" : ""}{" "}
                {normQuery && (
                  <>
                    for "<span className="font-medium">{normQuery}</span>"
                  </>
                )}
              </p>
            </div>

            <div
              className="product-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {filtered.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Search size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No medicines found
              </h3>
              <p className="text-gray-600 mb-6">
                {normQuery
                  ? `We couldn't find any medicines matching "${normQuery}". Try different keywords or browse our categories.`
                  : "Start typing to search for medicines, categories, or descriptions."}
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  to="/"
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Browse All Medicines
                </Link>
                <button
                  onClick={() => setQuery("")}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResults;
