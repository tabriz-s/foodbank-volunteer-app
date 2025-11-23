import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Calendar, Heart, Building2, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch real stats from backend
        const response = await axios.get(`${API_BASE_URL}/stats`);
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Fallback to mock data if API fails
        setStats({
          totalVolunteers: 150,
          activeEvents: 12,
          mealsServed: 5420,
          organizationsHelped: 8
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [API_BASE_URL]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles size={18} className="text-yellow-300" />
              <span className="text-sm font-medium">Making a Difference, One Meal at a Time</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Fighting Hunger
              <br />
              <span className="text-primary-200">Together</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-primary-100 max-w-3xl mx-auto leading-relaxed">
              Connect with local food banks and make a real impact in your community. 
              Every volunteer hour brings us closer to ending hunger.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="/register" 
                className="group inline-flex items-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span>Start Volunteering</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="/volunteer/register-events" 
                className="inline-flex items-center space-x-2 border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-200"
              >
                <Calendar size={20} />
                <span>Browse Events</span>
              </a>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-gray-50 dark:text-gray-900"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-16 -mt-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card group hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg group-hover:scale-110 transition-transform">
                    <Users size={28} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalVolunteers}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Volunteers</div>
                  </div>
                </div>
              </div>

              <div className="card group hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:scale-110 transition-transform">
                    <Calendar size={28} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeEvents}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Upcoming Events</div>
                  </div>
                </div>
              </div>

              <div className="card group hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:scale-110 transition-transform">
                    <Heart size={28} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.mealsServed?.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Meals Served</div>
                  </div>
                </div>
              </div>

              <div className="card group hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:scale-110 transition-transform">
                    <Building2 size={28} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.organizationsHelped}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Partner Organizations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Simple steps to start making a difference</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <Users size={36} className="text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-200 dark:bg-primary-800 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Create Your Profile</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Sign up and tell us about your skills, interests, and availability. We'll match you with opportunities that fit your schedule.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <Calendar size={36} className="text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center text-green-700 dark:text-green-300 font-bold">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Choose an Event</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Browse upcoming volunteer events at local food banks. Find opportunities that match your interests and schedule.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <Heart size={36} className="text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-200 dark:bg-orange-800 rounded-full flex items-center justify-center text-orange-700 dark:text-orange-300 font-bold">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Make an Impact</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Show up, help out, and make a real difference. Track your hours and see the impact you're making in your community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Join hundreds of volunteers who are helping fight hunger in our community
          </p>
          <a 
            href="/register" 
            className="inline-flex items-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <CheckCircle size={24} />
            <span>Get Started Today</span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;