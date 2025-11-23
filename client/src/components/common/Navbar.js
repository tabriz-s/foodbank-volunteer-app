import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun, User, LogOut, Settings, FileText, Calendar, BarChart3, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { currentUser, userRole, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 shadow-md">
                  <span className="text-white text-xl font-bold">SG</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-800 dark:text-white">
                  Singh's Generosity
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
              Home
            </Link>
            
            {currentUser && userRole === 'volunteer' && (
              <>
                <Link to="/volunteer/profile" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium flex items-center space-x-1">
                  <User size={16} />
                  <span>Profile</span>
                </Link>
                <Link to="/volunteer/register-events" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>Events</span>
                </Link>
                <Link to="/volunteer/history" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium flex items-center space-x-1">
                  <FileText size={16} />
                  <span>History</span>
                </Link>
              </>
            )}
            
            {currentUser && userRole === 'admin' && (
              <>
                <Link to="/admin/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
                  Dashboard
                </Link>
                <Link to="/admin/events" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
                  Events
                </Link>
                <Link to="/admin/matching" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
                  Matching
                </Link>
                <Link to="/admin/reports" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium flex items-center space-x-1">
                  <BarChart3 size={16} />
                  <span>Reports</span>
                </Link>
              </>
            )}
            
            {!currentUser && (
              <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
                About
              </Link>
            )}
          </div>

          {/* Right Section: Dark Mode + Auth */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center space-x-3">
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {currentUser.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole}</p>
                    </div>
                  </button>

                  {showUserMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowUserMenu(false)}
                      />
                      
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.email}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">
                            {userRole} Account
                          </p>
                        </div>
                        
                        <div className="py-2">
                          {userRole === 'volunteer' && (
                            <>
                              <Link
                                to="/volunteer/profile"
                                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <Settings size={16} />
                                <span>Profile Settings</span>
                              </Link>
                              <Link
                                to="/volunteer/history"
                                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <FileText size={16} />
                                <span>My History</span>
                              </Link>
                            </>
                          )}
                          
                          {userRole === 'admin' && (
                            <>
                              <Link
                                to="/admin/reports"
                                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <BarChart3 size={16} />
                                <span>Reports</span>
                              </Link>
                              <Link
                                to="/admin/events"
                                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <Calendar size={16} />
                                <span>Manage Events</span>
                              </Link>
                            </>
                          )}
                          
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <LogOut size={16} />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
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

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
            <Link to="/" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" onClick={() => setShowMobileMenu(false)}>
              Home
            </Link>
            
            {currentUser && userRole === 'volunteer' && (
              <>
                <Link to="/volunteer/profile" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" onClick={() => setShowMobileMenu(false)}>
                  Profile
                </Link>
                <Link to="/volunteer/register-events" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" onClick={() => setShowMobileMenu(false)}>
                  Events
                </Link>
                <Link to="/volunteer/history" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" onClick={() => setShowMobileMenu(false)}>
                  History
                </Link>
              </>
            )}
            
            {currentUser && userRole === 'admin' && (
              <>
                <Link to="/admin/dashboard" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" onClick={() => setShowMobileMenu(false)}>
                  Dashboard
                </Link>
                <Link to="/admin/events" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" onClick={() => setShowMobileMenu(false)}>
                  Events
                </Link>
                <Link to="/admin/matching" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" onClick={() => setShowMobileMenu(false)}>
                  Matching
                </Link>
                <Link to="/admin/reports" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" onClick={() => setShowMobileMenu(false)}>
                  Reports
                </Link>
              </>
            )}

            {!currentUser && (
              <>
                <Link to="/about" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" onClick={() => setShowMobileMenu(false)}>
                  About
                </Link>
                <div className="flex space-x-2 px-4 pt-2">
                  <Link to="/login" className="flex-1 btn-secondary text-center" onClick={() => setShowMobileMenu(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="flex-1 btn-primary text-center" onClick={() => setShowMobileMenu(false)}>
                    Register
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;