import React, { useMemo, useRef, useState, useEffect } from "react";
import "../styles/Categories.css";

export default function Categories({ products = [], selected = "All", onSelect = () => {} }) {
  const listRef = useRef();
  const [scrollIndex, setScrollIndex] = useState(0);

  // Compute counts per category
  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      const cat = p.category || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    counts["All"] = products.length;
    return counts;
  }, [products]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category || "Uncategorized")));
    return ["All", ...cats];
  }, [products]);

  const visibleCount = 7; // number of pills visible at once

  const maxIndex = Math.max(categories.length - visibleCount, 0);

  const scrollLeft = () => {
    setScrollIndex((prev) => Math.max(prev - 1, 0));
  };

  const scrollRight = () => {
    setScrollIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  useEffect(() => {
    if (listRef.current) {
      const child = listRef.current.children[0];
      const pillWidth = child ? child.offsetWidth + 8 : 150; // width + gap
      listRef.current.scrollTo({
        left: scrollIndex * pillWidth,
        behavior: "smooth",
      });
    }
  }, [scrollIndex]);

  return (
    <section className="categories">
      <h3 className="categories-title">Categories</h3>

      {/* Desktop Pills with Arrows */}
      <div className="desktop-category-wrapper desktop-only">
        <button className="scroll-btn left" onClick={scrollLeft} disabled={scrollIndex === 0}>
          &#8249;
        </button>
        <div className="category-list" ref={listRef} role="tablist">
          {categories.map((cat) => {
            const active = selected === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                className={`category-btn ${active ? "active" : ""}`}
                onClick={() => onSelect(cat)}
                aria-pressed={active}
                title={`${cat} (${count})`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
        <button
          className="scroll-btn right"
          onClick={scrollRight}
          disabled={scrollIndex === maxIndex}
        >
          &#8250;
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div className="category-select-wrapper mobile-only">
        <select
          className="category-select"
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          aria-label="Select product category"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat} ({categoryCounts[cat] || 0})
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
