import React from "react";

function scrollToProducts() {
  const productsSection = document.getElementById("products-section");
  if (productsSection) {
    productsSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">Medicose</h1>
        <p>
          Medicines, healthcare products, and Essentials at the best prices
          — delivered fast and safely.
        </p>
        <div className="hero-buttons ">
          <button
            onClick={scrollToProducts}
            className="hero-btn secondary-btn cursor-pointer"
            type="button"
          >
            Shop Now
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
