// src/pages/Home.js
import React, { useMemo, useState } from "react";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import FeaturedProducts from "../components/FeaturedProducts";
import Products from "../components/Products";
import productsData from "../data/products";

function Home({ searchQuery = "" }) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  // normalize search for comparison
  const q = String(searchQuery || "").trim().toLowerCase();

  // featured products (not affected by category selection, optionally you could filter them too)
  const featuredProducts = useMemo(
    () => productsData.filter((p) => p.isFeatured),
    []
  );

  // derive categories list from data (first element 'All')
  const categories = useMemo(() => {
    const cats = Array.from(new Set(productsData.map((p) => p.category || "Uncategorized")));
    return ["All", ...cats];
  }, []);

  // Filter products by search + selectedCategory
  const filteredProducts = useMemo(() => {
    return productsData.filter((p) => {
      const name = (p.name || "").toString().toLowerCase();
      const desc = (p.description || "").toString().toLowerCase();
      const cat = (p.category || "").toString();

      // category filter
      const categoryMatches = selectedCategory === "All" || cat === selectedCategory;

      // search filter (if query empty -> match)
      const searchMatches = !q || name.includes(q) || desc.includes(q) || cat.toLowerCase().includes(q);

      return categoryMatches && searchMatches;
    });
  }, [q, selectedCategory]);

  return (
    <div>
      <Hero />
     <Categories
        products={productsData}
        selected={selectedCategory}
        onSelect={(cat) => setSelectedCategory(cat)}
        />
      <FeaturedProducts products={featuredProducts} />
      <Products products={filteredProducts} />
    </div>
  );
}

export default Home;
