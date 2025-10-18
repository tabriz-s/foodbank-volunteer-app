import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🍽️</span>
              <span className="text-xl font-bold text-gray-800">
                Singh's Generosity
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </Link>
            
            {/* Show different links based on role */}
            {currentUser && userRole === 'volunteer' && (
              <>
                <Link to="/volunteer/profile" className="text-gray-700 hover:text-blue-600 transition-colors">
                  My Profile
                </Link>
                <Link to="/volunteer/history" className="text-gray-700 hover:text-blue-600 transition-colors">
                  History
                </Link>
              </>
            )}
            
            {currentUser && userRole === 'admin' && (
              <>
                <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
                <Link to="/admin/events" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Manage Events
                </Link>
                <Link to="/admin/matching" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Match Volunteers
                </Link>
              </>
            )}
            
            {!currentUser && (
              <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                About
              </Link>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              // Logged in - Show user menu
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none"
                >
                  <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    <span className="text-lg">👤</span>
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">
                        {currentUser.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                    </div>
                    <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    
                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{currentUser.email}</p>
                        <p className="text-xs text-gray-500 capitalize mt-1">
                          {userRole} Account
                        </p>
                      </div>
                      
                      <div className="py-2">
                        {userRole === 'volunteer' && (
                          <>
                            <Link
                              to="/volunteer/profile"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <span className="mr-2">⚙️</span>
                              Profile Settings
                            </Link>
                            <Link
                              to="/volunteer/history"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <span className="mr-2">📋</span>
                              My History
                            </Link>
                          </>
                        )}
                        
                        {userRole === 'admin' && (
                          <>
                            <Link
                              to="/admin/dashboard"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <span className="mr-2">🏠</span>
                              Dashboard
                            </Link>
                            <Link
                              to="/admin/events"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <span className="mr-2">📅</span>
                              Manage Events
                            </Link>
                          </>
                        )}
                        
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <span className="mr-2">🚪</span>
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Not logged in - Show login/register buttons
              <>
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;