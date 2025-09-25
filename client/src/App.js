import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import components over here
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProfilePage from './pages/volunteer/ProfilePage';
import VolunteerHistory from './pages/volunteer/VolunteerHistory';

// TODO: Import other pages as they're being created
// import VolunteerDashboard from './pages/volunteer/Dashboard';
// import AdminDashboard from './pages/admin/Dashboard';

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Test backend connection on app load
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
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        
        {/* Development Status Bar - REMOVE THIS ON FINAL SUBMISSION */}
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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Volunteer Routes */}
            <Route path="/volunteer/profile" element={<ProfilePage />} />
            <Route path="/volunteer/history" element={<VolunteerHistory />} />
            
            {/* TODO: Add protected routes as features are being developed */}
            {/* 
            <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            */}
            
            
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;