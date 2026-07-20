import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Package,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { useProductStore } from "../hooks/useProductStore";
import { createPortal } from "react-dom";

const SearchSuggestions = ({ query, onClose, onSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { products, loading, fetchAllProducts } = useProductStore();

  // Enhanced word-based matching algorithm like Google
  const getMatchingWords = (text, query) => {
    const textWords = text.toLowerCase().split(/\s+/);
    const queryWords = query.toLowerCase().trim().split(/\s+/);

    return textWords.filter((word) =>
      queryWords.some(
        (queryWord) => word.startsWith(queryWord) || word.includes(queryWord)
      )
    );
  };

  // Calculate relevance score for better sorting (like Google's ranking)
  const calculateRelevance = (product, query) => {
    const name = product.name?.toLowerCase() || "";
    const desc = product.description?.toLowerCase() || "";
    const category = product.category?.toLowerCase() || "";
    const queryLower = query.toLowerCase().trim();

    let score = 0;

    // Exact match gets highest score
    if (name.includes(queryLower)) score += 100;
    if (category.includes(queryLower)) score += 80;
    if (desc.includes(queryLower)) score += 60;

    // Word-based matching (Google-like)
    const nameWords = getMatchingWords(name, query);
    const descWords = getMatchingWords(desc, query);
    const categoryWords = getMatchingWords(category, query);

    score += nameWords.length * 30;
    score += categoryWords.length * 20;
    score += descWords.length * 10;

    // Bonus for shorter, more relevant names
    score += Math.max(0, 50 - name.length / 2);

    // Bonus for products in stock
    if (product.stock > 0) score += 5;

    return score;
  };

  // Highlight matching text (Google-style)
  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span
          key={index}
          className="font-semibold text-emerald-700 bg-emerald-50 px-0.5 rounded-sm"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Get stock status with visual indicators
  const getStockInfo = (stock) => {
    if (stock <= 0) {
      return {
        status: "out",
        text: "Out of Stock",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: <X size={12} />,
        message: "Currently unavailable",
      };
    } else if (stock <= 5) {
      return {
        status: "low",
        text: `Only ${stock} left`,
        color: "text-orange-700",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        icon: <AlertTriangle size={12} />,
        message: `Hurry! Only ${stock} remaining`,
      };
    } else if (stock <= 10) {
      return {
        status: "medium",
        text: `${stock} in stock`,
        color: "text-yellow-700",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        icon: <Zap size={12} />,
        message: `Good availability`,
      };
    } else {
      return {
        status: "high",
        text: `${stock} in stock`,
        color: "text-green-700",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: <Package size={12} />,
        message: "In stock",
      };
    }
  };

  // Fetch products on component mount if not already loaded (GUARD: only attempt once)
  const hasFetched = useRef(false);
  useEffect(() => {
    if (!hasFetched.current && products.length === 0 && !loading) {
      hasFetched.current = true;
      fetchAllProducts();
    }
  }, [products.length, loading, fetchAllProducts]);

  useEffect(() => {
    if (query.trim().length < 2 || products.length === 0) {
      setSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    const normalizedQuery = query.toLowerCase().trim();

    // Get product suggestions with enhanced scoring from API data
    const productSuggestions = products
      .map((product) => ({
        ...product,
        relevance: calculateRelevance(product, query),
      }))
      .filter((product) => product.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 6)
      .map((product) => ({
        type: "product",
        id: product._id || product.id,
        name: product.name,
        image: product.thumbnail || product.image,
        price: product.price,
        relevance: product.relevance,
        category: product.category,
        stock: product.stock,
      }));

    // Get category suggestions with scoring from API data
    const categories = [
      ...new Set(products.map((p) => p.category).filter(Boolean)),
    ];
    const categorySuggestions = categories
      .map((category) => ({
        type: "category",
        name: category,
        count: products.filter((p) => p.category === category).length,
        relevance: calculateRelevance(
          { name: category, description: "", category: "" },
          query
        ),
      }))
      .filter((category) => category.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 4)
      .map((category) => ({
        ...category,
      }));

    setSuggestions([...productSuggestions, ...categorySuggestions]);
    setIsOpen(true);
    setSelectedIndex(-1);
  }, [query, products]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation (Google-style)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || suggestions.length === 0) return;

      const maxIndex = suggestions.length - 1;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleSuggestionClick(suggestions[selectedIndex]);
          } else {
            handleViewAll();
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, suggestions, selectedIndex]);

  // Update position on window resize only (NOT on scroll — scroll causes re-render loops)
  useEffect(() => {
    const handleReposition = () => {
      // Force re-render to update position — only on resize, not scroll
      setIsOpen((prev) => !prev);
      setTimeout(() => setIsOpen(true), 0);
    };

    window.addEventListener("resize", handleReposition);

    return () => {
      window.removeEventListener("resize", handleReposition);
    };
  }, []); // Only mount/unmount — no deps that change every render

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === "product") {
      onSelect(suggestion);
    } else if (suggestion.type === "category") {
      navigate(`/search?q=${encodeURIComponent(suggestion.name)}`);
      onClose();
    }
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleViewAll = () => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
    onClose();
    setSelectedIndex(-1);
  };

  // Show loading state only while actively fetching (not when products are simply empty)
  if (loading && products.length === 0) {
    const searchContainer = document.querySelector(".search-container");
    const rect = searchContainer
      ? searchContainer.getBoundingClientRect()
      : { bottom: 0, left: 0, width: "100%" };

    return createPortal(
      <div
        className="bg-white rounded-xl shadow-2xl border border-gray-100 max-h-96 overflow-hidden backdrop-blur-sm p-4"
        style={{
          position: "fixed",
          top: (rect.bottom || 0) + window.scrollY + 4,
          left: (rect.left || 0) + window.scrollX,
          width: rect.width,
          zIndex: 2147483647,
          transform: "translateZ(0)",
        }}
      >
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="ml-2 text-gray-600">Loading medicines...</span>
        </div>
      </div>,
      document.body
    );
  }

  if (!isOpen || suggestions.length === 0) {
    return null;
  }

  // Calculate position relative to the search container
  const getDropdownPosition = () => {
    const searchContainer = document.querySelector(".search-container");
    if (!searchContainer) return { top: 0, left: 0, width: "100%" };

    const rect = searchContainer.getBoundingClientRect();
    return {
      top: (rect.bottom || 0) + window.scrollY + 4,
      left: (rect.left || 0) + window.scrollX,
      width: rect.width,
      maxWidth: "920px",
    };
  };

  const dropdownStyle = getDropdownPosition();

  const suggestionsContent = (
    <div
      ref={containerRef}
      className="bg-white rounded-xl shadow-2xl border border-gray-100 max-h-96 overflow-hidden backdrop-blur-sm"
      style={{
        boxShadow:
          "0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)",
        zIndex: 2147483647,
        transform: "translateZ(0)",
        willChange: "transform",
        pointerEvents: "auto",
        position: "fixed",
        ...dropdownStyle,
      }}
    >
      <div className="max-h-96 overflow-y-auto">
        {/* Products Section */}
        {suggestions.some((s) => s.type === "product") && (
          <div className="p-3">
            <div className="text-xs font-semibold text-gray-500 px-2 py-1.5 mb-2 flex items-center gap-1">
              <Package size={12} />
              Medicines
            </div>
            {suggestions
              .filter((s) => s.type === "product")
              .map((product, index) => {
                const stockInfo = getStockInfo(product.stock);
                return (
                  <button
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-all duration-150 text-left group ${
                      selectedIndex === index
                        ? "bg-emerald-50 border border-emerald-200"
                        : ""
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-contain rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-white font-medium">
                            Out
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate group-hover:text-emerald-700">
                        {highlightMatch(product.name, query)}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="text-sm font-semibold text-emerald-600">
                          ₹{product.price}
                        </div>
                        <div className="text-xs text-gray-500">
                          • {product.category}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${stockInfo.bgColor} ${stockInfo.color} border ${stockInfo.borderColor}`}
                      title={stockInfo.message}
                    >
                      {stockInfo.icon}
                      {stockInfo.text}
                    </div>
                  </button>
                );
              })}
          </div>
        )}

        {/* Categories Section */}
        {suggestions.some((s) => s.type === "category") && (
          <div className="border-t border-gray-100 p-3">
            <div className="text-xs font-semibold text-gray-500 px-2 py-1.5 mb-2 flex items-center gap-1">
              <TrendingUp size={12} />
              Categories
            </div>
            {suggestions
              .filter((s) => s.type === "category")
              .map((category, index) => (
                <button
                  key={category.name}
                  onClick={() => handleSuggestionClick(category)}
                  className={`w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all duration-150 text-left group ${
                    selectedIndex === suggestions.indexOf(category)
                      ? "bg-emerald-50 border border-emerald-200"
                      : ""
                  }`}
                >
                  <span className="text-sm font-medium text-gray-900 group-hover:text-emerald-700">
                    {highlightMatch(category.name, query)}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {category.count} items
                  </span>
                </button>
              ))}
          </div>
        )}

        {/* View All Results */}
        <div className="border-t border-gray-100 p-3">
          <button
            onClick={handleViewAll}
            className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-150 border border-emerald-200 hover:border-emerald-300"
          >
            <Search size={16} />
            <span>View all results for </span>
            <span className="font-semibold bg-emerald-100 px-1 rounded">
              "{query}"
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(suggestionsContent, document.body);
};

export default SearchSuggestions;
