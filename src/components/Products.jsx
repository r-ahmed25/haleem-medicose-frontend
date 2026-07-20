import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../STYLES/Products.css";

const ITEMS_PER_PAGE = 4;

function getMaxButtonsForWidth(width) {
  if (width <= 420) return 2;
  if (width <= 768) return 4;
  return 5;
}

function ProductCard({ product }) {
  const images = product.images?.length
    ? product.images
    : product.image
      ? [{ url: product.image, isPrimary: true }]
      : [];
  const [activeIndex, setActiveIndex] = useState(
    images.findIndex((img) => img.isPrimary) >= 0
      ? images.findIndex((img) => img.isPrimary)
      : 0
  );

  useEffect(() => {
    const primaryIndex = images.findIndex((img) => img.isPrimary);
    setActiveIndex(primaryIndex >= 0 ? primaryIndex : 0);
  }, [product._id, images.length]);

  const nextImage = () => setActiveIndex((i) => (i + 1) % images.length);
  const prevImage = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));

  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <img
          src={images[activeIndex]?.url || ""}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            if (product.image && e.currentTarget.src !== product.image) {
              e.currentTarget.src = product.image;
            } else {
              e.currentTarget.style.display = "none";
            }
          }}
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="carousel-btn left"
              onClick={(e) => {
                e.preventDefault();
                prevImage();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="carousel-btn right"
              onClick={(e) => {
                e.preventDefault();
                nextImage();
              }}
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
            <div className="carousel-dots">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`dot ${idx === activeIndex ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveIndex(idx);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="description">{product.description}</p>
        <p className="price">₹{product.price}</p>
        <p className="stock">
          {typeof product.stock === "number"
            ? product.stock > 0
              ? `${product.stock} in stock`
              : "Out of stock"
            : product.stock}
        </p>
        <Link to={`/product/${product._id}`} className="details-link">
          View Details
        </Link>
      </div>
    </div>
  );
}

function Products({ products = [] }) {
  const [page, setPage] = useState(1);
  const [maxButtons, setMaxButtons] = useState(() =>
    typeof window !== "undefined" ? getMaxButtonsForWidth(window.innerWidth) : 7
  );
  useEffect(() => {
    const handleResize = () => {
      setMaxButtons(getMaxButtonsForWidth(window.innerWidth));
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [products]);

  const totalItems = products.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const paged = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return products.slice(start, start + ITEMS_PER_PAGE);
  }, [products, page]);

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  return (
    <section id="products-section" className="products">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>All Products</h2>
        <div className="showing-info" style={{ fontSize: 14, color: "#555" }}>
          {totalItems === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1} -{" "}
          {Math.min(page * ITEMS_PER_PAGE, totalItems)} of {totalItems}
        </div>
      </div>

      <div className="product-list">
        {paged.length > 0 ? (
          paged.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p>No products available.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div
          className="pagination"
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginTop: 18,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="page-btn prev-next"
          >
            Prev
          </button>

          {(() => {
            const pages = [];
            const MAX = maxButtons;
            let start = 1;
            let end = totalPages;

            if (totalPages > MAX) {
              const half = Math.floor(MAX / 2);
              start = Math.max(1, page - half);
              end = start + MAX - 1;
              if (end > totalPages) {
                end = totalPages;
                start = Math.max(1, end - MAX + 1);
              }
            }

            for (let p = start; p <= end; p++) {
              pages.push(
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`page-btn ${p === page ? "active" : ""}`}
                  aria-current={p === page ? "page" : undefined}
                  style={{ cursor: "pointer" }}
                >
                  {p}
                </button>
              );
            }
            return pages;
          })()}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="page-btn prev-next"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}

export default Products;
