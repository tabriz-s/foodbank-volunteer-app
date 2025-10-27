import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import AuthProvider
import { AuthProvider } from './contexts/AuthContext';
//import { MockAuthProvider } from './contexts/MockAuthContext'; // use for testing is complete

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
import ProfilePage from './pages/volunteer/ProfilePage';
import VolunteerHistory from './pages/volunteer/VolunteerHistory';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageEvents from './pages/admin/ManageEvents';
import VolunteerMatchingForm from "./components/admin/VolunteerMatchingForm";
import { NotificationProvider } from "./contexts/NotificationContext";

// Temporary mock user (replace later with real login data)
const currentUser = { id: 99, role: "admin", name: "Admin User" };

// Separate wrapper for notifications system
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
        setApiStatus('✅ Connected to Backend');
        console.log('Backend connected:', response.data);
      } catch (error) {
        setApiStatus('❌ Backend Connection Failed');
        console.error('Backend connection failed:', error);
      }
    };

    testConnection();
  }, [API_BASE_URL]);

  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Development Status Bar */}
            <div className="bg-blue-100 border-b border-blue-200 px-4 py-2">
              <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
                <span className="text-blue-800">
                  🚧 Development Mode - Volunteer Management System
                </span>
                <span className="text-blue-600">
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

                {/* Volunteer Routes - Protected */}
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
                    <ProtectedRoute allowedRoles={['volunteer']}>
                      <VolunteerHistory />
                    </ProtectedRoute>
                  } 
                />

                {/* Admin Routes - Protected */}
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

                {/* Catch all route - redirect to home */}
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
  );
}

export default App;