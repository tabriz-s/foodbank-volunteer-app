import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedRoute Component
 * Restricts access to routes based on user roles
 * 
 * @param {React.Component} children - Component to render if authorized
 * @param {string[]} allowedRoles - Array of roles allowed to access this route
 * @param {boolean} requireAuth - Whether authentication is required (default: true)
 */
const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const { currentUser, userRole, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !currentUser) {
    // Redirect to login, but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = getDashboardPath(userRole);
    return (
      <Navigate 
        to={redirectPath} 
        state={{ 
          from: location,
          message: 'You dont have permission to access this page' 
        }} 
        replace 
      />
    );
  }

  // User is authenticated and authorized
  return children;
};

/**
 * Get the appropriate dashboard path for a user role
 */
const getDashboardPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'employee':
      return '/employee/dashboard';
    case 'volunteer':
      return '/volunteer/dashboard';
    default:
      return '/';
  }
};

export default ProtectedRoute;