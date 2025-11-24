import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import products from "../data/products";
import "./ProductDetails.css";
import { useAuthStore } from "../hooks/useAuthStore";
import { useCartStore } from "../hooks/useCartStore";
import toast from "react-hot-toast";
import { useProductStore } from "../hooks/useProductStore";

function ProductDetails({productsArray}) {
  const { id } = useParams();
  const navigate = useNavigate();
    const { user } = useAuthStore();
  
  const { addToCart } = useCartStore();
  const {products} = useProductStore();

  const product1 = products.find((p) => String(p._id) === id);

  if (!product1) return <h2>Product not found</h2>;

    const handleAddToCart = () => {
      if (!user) {
        toast.error("Please login to add products to cart", { id: "login" });
        return;
      } else {
        addToCart(product1);
      }
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
          <p><strong>Category:</strong> {product1.category}</p>
          <p className="price"><strong>Price:</strong> ₹{product1.price}</p>
          <p className="stock">
            <strong>Stock:</strong>{" "}
            {product1.stock > 0 ? `${product1.stock} available` : "Out of stock"}
          </p>

          <div className="details-buttons">
            <button className="buy-btn" onClick={handleAddToCart}>🛒 Add To Cart</button>
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
