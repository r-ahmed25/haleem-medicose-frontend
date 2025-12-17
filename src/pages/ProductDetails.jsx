import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productsData from "../data/products";
import "./ProductDetails.css";
import { useAuthStore } from "../hooks/useAuthStore";
import { useCartStore } from "../hooks/useCartStore";
import toast from "react-hot-toast";
import { useProductStore } from "../hooks/useProductStore";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, Keyboard } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
export const cloudinaryBgRemoved = (url, width = 600) => {
  if (!url || !url.includes("cloudinary")) return url;

  return url.replace(
    "/upload/",
    `/upload/e_background_removal,w_${width},f_auto,q_auto/`
  );
};

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToCart, refreshTrigger } = useCartStore();
  const { products, loading, fetchAllProducts } = useProductStore();

  const [activeIndex, setActiveIndex] = useState(0);
  const lastRefreshTrigger = useRef(0);
  const imgRef = useRef(null);

  useEffect(() => {
    if (products.length === 0 && !loading) {
      fetchAllProducts();
    }
  }, [products.length, loading, fetchAllProducts]);

  useEffect(() => {
    if (refreshTrigger > lastRefreshTrigger.current) {
      lastRefreshTrigger.current = refreshTrigger;
      fetchAllProducts();
    }
  }, [refreshTrigger]);

  const product =
    products.find((p) => String(p._id) === id) ||
    productsData.find((p) => String(p._id) === id);

  /* ---------- NORMALIZE IMAGES ---------- */
  const images = product?.images?.length
    ? product.images
    : product?.image
    ? [{ url: product.image, isPrimary: true }]
    : [];

  useEffect(() => {
    const primaryIndex = images.findIndex((img) => img.isPrimary);
    setActiveIndex(primaryIndex >= 0 ? primaryIndex : 0);
  }, [product?._id]);

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (!product) return <h2>Product not found</h2>;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    imgRef.current.style.transformOrigin = `${x}% ${y}%`;
  };

  const handleMouseLeave = () => {
    imgRef.current.style.transformOrigin = "center";
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add products to cart");
      return;
    }
    addToCart(product);
  };

  const nextImage = () => setActiveIndex((i) => (i + 1) % images.length);

  const prevImage = () =>
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));

  return (
    <div className="page product-details">
      <div className="product-details-container">
        {/* -------- IMAGE CAROUSEL -------- */}
        <div className="product-gallery">
          <div className="main-image-wrapper">
            <div
              className="zoom-container"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <img
                ref={imgRef}
                src={images[activeIndex]?.url}
                alt={product.name}
                className="main-product-image zoom-image"
              />
            </div>

            {images.length > 1 && (
              <>
                <button className="nav left" onClick={prevImage}>
                  <ChevronLeft />
                </button>
                <button className="nav right" onClick={nextImage}>
                  <ChevronRight />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="thumbnail-row">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img.url}
                  alt=""
                  className={`thumbnail ${
                    index === activeIndex ? "active" : ""
                  }`}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* -------- PRODUCT INFO -------- */}
        <div className="product-details-info">
          <h2>{product.name}</h2>
          <p className="description">{product.description}</p>

          <p>
            <strong>Category:</strong> {product.category}
          </p>

          <p className="price">
            <strong>Price:</strong> ₹{product.price}
          </p>

          <p className="stock">
            <strong>Stock:</strong>{" "}
            {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
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
