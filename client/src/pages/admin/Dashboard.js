import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { NotificationContext } from '../../contexts/NotificationContext';
import { fetchDashboardStats, fetchRecentActivities } from '../../services/adminAPI';

const AdminDashboard = () => {
    // dashboard stats and data
    const [dashboardStats, setDashboardStats] = useState({
        totalEvents: 0,
        totalVolunteers: 0,
        activeEvents: 0,
        pendingMatches: 0
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [activeSection, setActiveSection] = useState('overview');
    const [currentUser, setCurrentUser] = useState('Admin User');
    
    // Get notifications for activity feed
    const { addNotification, notifications } = useContext(NotificationContext);

// Fetch real data from backend
useEffect(() => {
    const loadDashboard = async () => {
        try {
            const stats = await fetchDashboardStats();
            setDashboardStats(stats.data);
            
            const activities = await fetchRecentActivities();
            setRecentActivities(activities);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    };
    
    loadDashboard();
}, []);

    

    // menu options for the admin
const sidebarItems = [
        {id: 'overview',label: 'Overview'},
        {id: 'quick-actions',label: 'Quick Actions'},
        {id: 'recent-activity',label: 'Recent Activity'}
];

    //action buttons that link to other pages
const quickActionButtons = [
        {
            title: 'Event Management',
            description: 'Create and manage volunteer events',
            buttonText: 'Manage Events',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-700',
            buttonBg: 'bg-blue-600 hover:bg-blue-700',
            path: '/admin/events'
        },
        {
            title: 'Volunteer Matching',
            description: 'Match volunteers to events',
            buttonText: 'Start Matching',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-700',
            buttonBg: 'bg-green-600 hover:bg-green-700',
            path: '/admin/matching'
        },
        {
            title: 'Volunteer History',
            description: 'View volunteer participation records',
            buttonText: 'View History',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            textColor: 'text-orange-700',
            buttonBg: 'bg-orange-600 hover:bg-orange-700',
            path: '/volunteer/history'
        }
];
const renderOverview = () => (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-blue-600">Total Events</p>
                            <p className="text-2xl font-bold text-blue-900">{dashboardStats.totalEvents}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-green-600">Total Volunteers</p>
                            <p className="text-2xl font-bold text-green-900">{dashboardStats.totalVolunteers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-yellow-600">Active Events</p>
                            <p className="text-2xl font-bold text-yellow-900">{dashboardStats.activeEvents}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-purple-600">Pending Matches</p>
                            <p className="text-2xl font-bold text-purple-900">{dashboardStats.pendingMatches}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Welcome message */}
            <div className="bg-blue-600 rounded-lg p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Welcome back, {currentUser}!</h2>
                <p className="text-blue-100">Here's what's happening with your volunteer management platform today.</p>
            </div>
        </div>
);

// quick actions section with navigation buttons
const renderQuickActions = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quickActionButtons.map((action, idx) => (
                    <div key={idx} className={`${action.bgColor} border ${action.borderColor} rounded-lg p-6 hover:shadow-md transition-shadow`}>
                        <h3 className={`text-lg font-medium ${action.textColor} mb-2`}>{action.title}</h3>
                        <p className={`text-sm ${action.textColor} mb-4`}>{action.description}</p>
                        <Link
                            to={action.path}
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${action.buttonBg} focus:outline-none focus:ring-2 focus:ring-offset-2`}
                       >
                            {action.buttonText}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
);

const renderRecentActivity = () => {
        const combinedActivities = [
            ...notifications.slice(0, 3).map(notification => ({
                id: `notif-${notification.id}`,
                action: notification.message,
                name: '',
                time: notification.time
            })),
            ...recentActivities
       ];

        return (
            <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {combinedActivities.length === 0 ? (
                            <div className="px-6 py-8 text-center">
                                <p className="text-gray-500">No recent activity</p>
                            </div>
                        ) : (
                            combinedActivities.slice(0, 8).map((activity) => (
                                <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                            {activity.name && (
                                                <p className="text-sm text-gray-600">{activity.name}</p>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500">{activity.time}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                {combinedActivities.length > 8 && (
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Showing 8 most recent activities</p>
                    </div>
                )}
            </div>
        );
};
    
const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return renderOverview();
            case 'quick-actions':
                return renderQuickActions();
            case 'recent-activity':
                return renderRecentActivity();
            default:
                return renderOverview();
      }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Header with user info */}
                <div className="px-4 py-4 sm:px-0 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="mt-1 text-sm text-gray-600">Manage volunteers and events</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">Logged in as:</span>
                            <span className="text-sm font-medium text-gray-900">{currentUser}</span>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow rounded-lg">
                        <div className="divide-y divide-gray-200 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x">

                            {/* Sidebar */}
                            <aside className="py-6 lg:col-span-3">
                                <nav className="space-y-1">
                                    <div className="px-6 mb-6">
                                        <h2 className="text-lg font-medium text-gray-900">Navigation</h2>
                                    </div>
                                    {/* Sidebar buttons */}
                                    {sidebarItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveSection(item.id)}
                                            className={`${
                                                activeSection === item.id
                                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                    : 'border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900'
                                            } group border-l-4 px-6 py-3 flex items-center text-sm font-medium w-full text-left`}
                                        >
                                            <span className="truncate">{item.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </aside>

                            {/* Main content area */}
                            <div className="divide-y divide-gray-200 lg:col-span-9">
                                <div className="py-6 px-4 sm:p-6 lg:pb-8">
                                    <div className="mb-8">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {sidebarItems.find(item => item.id === activeSection)?.label}
                                        </h3>
                                    </div>

                                    {renderContent()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
