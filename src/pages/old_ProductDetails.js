import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productsData from "../data/products";
import "./ProductDetails.css";
import { useAuthStore } from "../hooks/useAuthStore";
import { useCartStore } from "../hooks/useCartStore";
import toast from "react-hot-toast";
import { useProductStore } from "../hooks/useProductStore";

function ProductDetails({ productsArray }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { addToCart, refreshTrigger } = useCartStore();
  const { products, loading, fetchAllProducts } = useProductStore();
  const lastRefreshTrigger = useRef(0); // Start at 0 to trigger on first refresh

  // Fetch products if not loaded
  useEffect(() => {
    if (products.length === 0 && !loading) {
      fetchAllProducts();
    }
  }, [products.length, loading, fetchAllProducts]);

  // Refetch when refresh trigger changes
  useEffect(() => {
    if (refreshTrigger > lastRefreshTrigger.current) {
      lastRefreshTrigger.current = refreshTrigger;
      fetchAllProducts();
    }
  }, [refreshTrigger]); // Remove fetchAllProducts from dependencies to prevent loops

  // Try to find product in API products first, then fallback to local data
  const product1 =
    products.find((p) => String(p._id) === id) ||
    productsData.find((p) => String(p._id) === id);

  if (loading) {
    return (
      <div className="page product-details">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-gray-600">Loading product details...</span>
        </div>
      </div>
    );
  }

  if (!product1) return <h2>Product not found</h2>;

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add products to cart", { id: "login" });
      return;
    }
    addToCart(product1);
  };

  return (
    <div className="page product-details">
      <div className="product-details-container">
        <img
          src={product1.image}
          alt={product1.name}
          className="product-details-image"
        />
        <div className="product-details-info">
          <h2>{product1.name}</h2>
          <p className="description">{product1.description}</p>
          <p>
            <strong>Category:</strong> {product1.category}
          </p>
          <p className="price">
            <strong>Price:</strong> ₹{product1.price}
          </p>
          <p className="stock">
            <strong>Stock:</strong>{" "}
            {product1.stock > 0
              ? `${product1.stock} available`
              : "Out of stock"}
          </p>

          <div className="details-buttons">
            {user?.role !== "admin" && (
              <button className="buy-btn" onClick={handleAddToCart}>
                🛒 Add To Cart
              </button>
            )}
            <button className="back-btn" onClick={() => navigate(-1)}>
              ⬅ Back to Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
