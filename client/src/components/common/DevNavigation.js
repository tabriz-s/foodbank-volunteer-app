import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DevNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const pages = [
    // Auth Pages
    { path: '/login', name: 'Login', category: 'Auth' },
    { path: '/register', name: 'Register', category: 'Auth' },
    
    // Volunteer pages
    //{ path: '/volunteer/dashboard', name: 'Volunteer Dashboard', category: 'Volunteer' },
    { path: '/volunteer/profile', name: 'Volunteer Profile', category: 'Volunteer' },
    //{ path: '/volunteer/events', name: 'Available Events', category: 'Volunteer' },
    { path: '/volunteer/history', name: 'Volunteer History', category: 'Volunteer' },
    
    // Admin pages
    { path: '/admin/dashboard', name: 'Admin Dashboard', category: 'Admin' },
    { path: '/admin/events', name: 'Manage Events', category: 'Admin' },
    // { path: '/admin/volunteers', name: 'Manage Volunteers', category: 'Admin' },
    { path: '/admin/matching', name: 'Volunteer Matching', category: 'Admin' },
    
    // Other pages
    { path: '/', name: 'Home', category: 'Public' },
    { path: '/about', name: 'About', category: 'Public' },
  ];

  const groupedPages = pages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = [];
    }
    acc[page.category].push(page);
    return acc;
  }, {});

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-7 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        title="Developer Navigation"
      >
        <span className="text-sm font-bold">🔧</span>
      </button>

      {/* side panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* header */}
        <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
          <h3 className="font-bold text-lg">Dev Nav</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-gray-200 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* content */}
        <div className="p-4 h-full overflow-y-auto bg-gray-50">
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-xs text-yellow-800">
               <strong>DEVELOPMENT ONLY</strong><br />
              Just quick access to all pages. This will NOT appear in in final subbmission.
            </p>
          </div>

          {/* These are the page links by category */}
          {Object.entries(groupedPages).map(([category, categoryPages]) => (
            <div key={category} className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-2 pb-1 border-b border-gray-300">
                {category} Pages
              </h4>
              <div className="space-y-1">
                {categoryPages.map((page) => (
                  <Link
                    key={page.path}
                    to={page.path}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-purple-100 hover:text-purple-700 rounded transition-colors"
                  >
                    {page.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Current route info */}
          <div className="mt-6 p-3 bg-blue-100 border border-blue-300 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Current URL:</strong><br />
              <code className="text-xs">{window.location.pathname}</code>
            </p>
          </div>

        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default DevNavigation;
