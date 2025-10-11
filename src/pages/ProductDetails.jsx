import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import products from "../data/products";
import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Match product by MongoDB's _id (string)
  const product = products.find((p) => String(p._id) === id);

  if (!product) return <h2>Product not found</h2>;

  return (
    <div className="page product-details">
      <div className="product-details-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-details-image"
        />
        <div className="product-details-info">
          <h2>{product.name}</h2>
          <p className="description">{product.description}</p>
          <p><strong>Category:</strong> {product.category}</p>
          <p className="price"><strong>Price:</strong> ₹{product.price}</p>
          <p className="stock">
            <strong>Stock:</strong>{" "}
            {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
          </p>

          <div className="details-buttons">
            <button className="buy-btn">🛒 Buy Now</button>
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
