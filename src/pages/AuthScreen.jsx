import React, { useState } from 'react';
import { useAuthStore } from '../hooks/useAuthStore';
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, ArrowRight, Loader } from "lucide-react";

import '../styles/AuthScreen.css';

const AuthScreen = () => {
  const [isSignup, setIsSignup] = useState(false);
  const { signup, login, logout, message, isAuthenticated, clearMessage } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'customer',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    clearMessage();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    isSignup ? signup(formData) : login(formData);
  };

  return (
    <div className="auth-container">
      <h2>{isSignup ? 'Create Your Account' : 'Welcome Back'}</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        {isSignup && (
          <>
            <div className="auth-form-group">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>

            <div className="auth-form-group">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="role-select"
                aria-label="Account Type"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </>
        )}

        <div className="auth-form-group">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>

        <div className="auth-form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={isSignup ? "6" : undefined}
          />
        </div>

        <button type="submit" className="auth-button" disabled={!formData.email || !formData.password || (isSignup && !formData.fullName)}>
          {isSignup ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      <p className="toggle-text">
        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
        <span onClick={() => setIsSignup(!isSignup)} role="button" tabIndex={0}>
          {isSignup ? 'Sign In' : 'Sign Up'}
        </span>
      </p>

      {isAuthenticated && (
        <button onClick={logout} className="logout-button">
          Sign Out
        </button>
      )}

      {message && (
        <p className={`auth-message ${message.includes('success') || message.includes('Login successful') || message.includes('User registered') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default AuthScreen;