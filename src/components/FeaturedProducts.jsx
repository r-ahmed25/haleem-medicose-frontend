import React from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "../styles/FeaturedProducts.css";

function FeaturedProducts({ products }) {
  const navigate = useNavigate();
  const featured = products.filter((p) => p.isFeatured);

  return (
    <div className="featured-products-container cursor-pointer">
      <h2 className="title">Featured Products</h2>
      <Swiper
        modules={[Autoplay]}
        slidesPerView={3}
        spaceBetween={20}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        loop
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {featured.map((product) => (
          <SwiperSlide key={product._id}>
            <div
              className="product-card"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p className="price">₹{product.price}</p>
              <span className="view-details">View Details</span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default FeaturedProducts;
