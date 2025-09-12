import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Test backend connection with mock stats
        const response = await axios.get(`${API_BASE_URL}/health`);
        if (response.data) {
          // Mock stats for now, we'll have to replace with real API call later
          setStats({
            totalVolunteers: 150,
            activeEvents: 12,
            mealsServed: 5420,
            organizationsHelped: 8
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [API_BASE_URL]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Fighting Hunger Together
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Connect with local food banks and make a difference in your community
          </p>
          <div className="space-x-4">
            <a href="/register" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Volunteer Now
            </a>
            <a href="/events" className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Browse Events
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="p-6">
                <div className="text-3xl font-bold text-blue-600">{stats.totalVolunteers}</div>
                <div className="text-gray-600 mt-2">Active Volunteers</div>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-green-600">{stats.activeEvents}</div>
                <div className="text-gray-600 mt-2">Upcoming Events</div>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-orange-600">{stats.mealsServed.toLocaleString()}</div>
                <div className="text-gray-600 mt-2">Meals Served</div>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-purple-600">{stats.organizationsHelped}</div>
                <div className="text-gray-600 mt-2">Partner Organizations</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to start making a difference</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">Create your volunteer profile and tell us about your skills and availability.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Events</h3>
              <p className="text-gray-600">Browse volunteer opportunities that match your interests and schedule.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Make Impact</h3>
              <p className="text-gray-600">Show up, help out, and make a real difference in your community.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;