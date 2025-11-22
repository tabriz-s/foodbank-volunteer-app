import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from "./contexts/NotificationContext";

// Import components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import DevNavigation from './components/common/DevNavigation';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import About from "./pages/About";
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import NotificationSystem from './components/common/NotificationSystem';

// Volunteer pages
import ProfilePage from './pages/volunteer/ProfilePage'; 
import VolunteerHistory from './pages/volunteer/VolunteerHistory';
import EventRegistration from './pages/volunteer/EventRegistration'; 

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageEvents from './pages/admin/ManageEvents';
import VolunteerMatchingForm from "./components/admin/VolunteerMatchingForm";
import Reports from './pages/admin/Reports';

// Notification wrapper
function NotificationWrapper() {
  const location = useLocation();
  const hiddenRoutes = ['/login', '/register'];

  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }
  return <NotificationSystem />;
}

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/health`);
        setApiStatus('✅ Connected');
        console.log('Backend connected:', response.data);
      } catch (error) {
        setApiStatus('❌ Offline');
        console.error('Backend connection failed:', error);
      }
    };

    testConnection();
  }, [API_BASE_URL]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
              <Navbar />

              {/* Development Status Bar */}
              <div className="bg-primary-100 dark:bg-primary-900/30 border-b border-primary-200 dark:border-primary-800 px-4 py-2">
                <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
                  <span className="text-primary-800 dark:text-primary-300 font-medium">
                    🚧 Development Mode
                  </span>
                  <span className="text-primary-600 dark:text-primary-400">
                    Backend: {apiStatus}
                  </span>
                </div>
              </div>

              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Volunteer Routes */}
                  <Route
                    path="/volunteer/profile"
                    element={
                      <ProtectedRoute allowedRoles={['volunteer']}>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/volunteer/history"
                    element={
                      <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                        <VolunteerHistory />
                      </ProtectedRoute>
                    }
                  />
                  <Route 
                    path="/volunteer/register-events" 
                    element={
                      <ProtectedRoute allowedRoles={['volunteer']}>
                        <EventRegistration />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/events"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <ManageEvents />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/matching"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <VolunteerMatchingForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/reports"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <Reports />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch all */}
                  <Route path="*" element={<Home />} />
                </Routes>
              </main>

              <Footer />
              <NotificationWrapper />
              <DevNavigation />
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;