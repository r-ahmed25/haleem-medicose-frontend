// src/pages/Home.js
import React, { use, useEffect, useMemo, useState } from "react";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import FeaturedProducts from "../components/FeaturedProducts";
import Products from "../components/Products";
import productsData from "../data/products";
import { useProductStore } from "../hooks/useProductStore";

function Home({ searchQuery = "" }) {
  const { products, loading } = useProductStore();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const q = String(searchQuery || "")
    .trim()
    .toLowerCase();

  const allProducts = products.length > 0 ? products : productsData;

  const featuredProducts = useMemo(
    () => allProducts.filter((p) => p.isFeatured),
    [allProducts]
  );

  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(allProducts.map((p) => p.category || "Uncategorized"))
    );
    return ["All", ...cats];
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts?.filter((p) => {
      const name = (p.name || "").toString().toLowerCase();
      const desc = (p.description || "").toString().toLowerCase();
      const cat = (p.category || "").toString();

      // category filter
      const categoryMatches =
        selectedCategory === "All" || cat === selectedCategory;

      // search filter (if query empty -> match)
      const searchMatches =
        !q ||
        name.includes(q) ||
        desc.includes(q) ||
        cat.toLowerCase().includes(q);

      return categoryMatches && searchMatches;
    });
  }, [allProducts, q, selectedCategory]);

  // Scroll to products section when category is selected
  useEffect(() => {
    if (selectedCategory !== "All") {
      const element = document.getElementById("products-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [selectedCategory]);

  return (
    <div>
      <Hero />
      <Categories
        products={allProducts}
        selected={selectedCategory}
        onSelect={(cat) => setSelectedCategory(cat)}
      />
      <FeaturedProducts products={featuredProducts} />
      <Products products={filteredProducts} />
    </div>
  );
}

export default Home;
