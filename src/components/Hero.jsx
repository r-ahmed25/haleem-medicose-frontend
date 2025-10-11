import React from "react";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Your Trusted Online Medical Store</h1>
        <p>Find medicines, healthcare products, and essentials at the best prices — delivered fast and safely.</p>
        <div className="hero-buttons">
          <Link to="/about" className="hero-btn primary-btn">Learn More</Link>
          <Link to="/" className="hero-btn secondary-btn">Shop Now</Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
