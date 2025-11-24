import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuthStore";

export default function ProtectedRoute({ element }) {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? element : <Navigate to="/login" replace />;
}
