import React from "react";

function Footer() {
  return (
    <footer
      style={{
        background:
          "linear-gradient(135deg, rgba(0, 128, 128, 0.95) 0%, rgba(0, 51, 102, 0.95) 50%, rgba(0, 100, 100, 0.95) 100%)",
        backdropFilter: "blur(10px)",
        boxShadow:
          "0 -15px 35px rgba(0, 128, 128, 0.15), 0 -8px 20px rgba(0, 51, 102, 0.1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative gradient overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(circle at 80% 80%, rgba(46, 204, 113, 0.15) 0%, transparent 50%)",
        }}
      />
      <p className="relative z-10">
        &copy; 2025 Haleem Medicose. All Rights Reserved.
      </p>
    </footer>
  );
}

export default Footer;
