import React, { useState } from "react";
import { useAuthStore } from "../hooks/useAuthStore";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, ArrowRight, Loader } from "lucide-react";

import "../styles/AuthScreen.css";

const AuthScreen = () => {
  const [isSignup, setIsSignup] = useState(false);
  const { signup, login, logout, message, isAuthenticated, clearMessage } =
    useAuthStore();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "customer",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    clearMessage();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    isSignup ? signup(formData) : login(formData);
  };

  return (
    <div className="min-h-screen py-16 px-4">
      {/* Enhanced center card with theme-matching gradient background */}
      <div
        className="max-w-2xl mx-auto p-8 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(0, 128, 128, 0.95) 0%, rgba(0, 51, 102, 0.95) 50%, rgba(0, 100, 100, 0.95) 100%)",
          boxShadow:
            "0 25px 50px rgba(0, 128, 128, 0.25), 0 15px 35px rgba(0, 51, 102, 0.2)",
        }}
      >
        {/* Decorative gradient overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(46, 204, 113, 0.15) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
              {isSignup ? "Create Your Account" : "Welcome Back"}
            </h2>
            <p className="text-white/90 text-sm leading-relaxed">
              {isSignup
                ? "Join Haleem Medicose and start your health journey today."
                : "Sign in to your account to continue."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Account Type
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm"
                    aria-label="Account Type"
                  >
                    <option value="customer" className="bg-gray-800 text-white">
                      Customer
                    </option>
                    <option value="admin" className="bg-gray-800 text-white">
                      Admin
                    </option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={isSignup ? "6" : undefined}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 backdrop-blur-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait disabled:hover:scale-100"
              style={{
                background: "linear-gradient(135deg, var(--accent), #004466)",
              }}
              disabled={
                !formData.email ||
                !formData.password ||
                (isSignup && !formData.fullName)
              }
            >
              {isSignup ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-white/80">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <span
              onClick={() => setIsSignup(!isSignup)}
              role="button"
              tabIndex={0}
              className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </span>
          </p>

          {isAuthenticated && (
            <button
              onClick={logout}
              className="mt-4 w-full flex justify-center items-center gap-2 py-2 px-4 rounded-xl text-sm font-medium text-white transition-all duration-200 bg-red-600 hover:bg-red-700"
            >
              Sign Out
            </button>
          )}

          {message && (
            <p
              className={`mt-4 text-center text-sm ${
                message.includes("success") ||
                message.includes("Login successful") ||
                message.includes("User registered")
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
