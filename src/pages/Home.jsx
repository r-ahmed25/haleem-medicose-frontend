// src/pages/Home.js
import React, { use, useMemo, useState } from "react";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import FeaturedProducts from "../components/FeaturedProducts";
import Products from "../components/Products";
import productsData from "../data/products";
import { useProductStore } from "../hooks/useProductStore";

function Home({ searchQuery = "" }) {
  const { products, loading } = useProductStore();
  const [selectedCategory, setSelectedCategory] = useState("All");

  // normalize search for comparison
  const q = String(searchQuery || "")
    .trim()
    .toLowerCase();

  // Use API products if available, otherwise fallback to local products data
  const allProducts = products.length > 0 ? products : productsData;

  // featured products (not affected by category selection, optionally you could filter them too)
  const featuredProducts = useMemo(
    () => allProducts.filter((p) => p.isFeatured),
    [allProducts]
  );

  // derive categories list from data (first element 'All')
  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(allProducts.map((p) => p.category || "Uncategorized"))
    );
    return ["All", ...cats];
  }, [allProducts]);

  // Filter products by search + selectedCategory
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
