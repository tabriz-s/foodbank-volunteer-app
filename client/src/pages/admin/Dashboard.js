import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { NotificationContext } from '../../contexts/NotificationContext';
import { fetchDashboardStats, fetchRecentActivities } from '../../services/adminAPI';
import { Calendar, Users, Clock, ClipboardList, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
    // Dashboard stats and data
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
    // Menu options for the admin
    const sidebarItems = [
        { id: 'overview', label: 'Overview' },
        { id: 'quick-actions', label: 'Quick Actions' },
        { id: 'recent-activity', label: 'Recent Activity' }
    ];
    // Action buttons that link to other pages
    const quickActionButtons = [
        {
            title: 'Event Management',
            description: 'Create and manage volunteer events',
            buttonText: 'Manage Events',
            icon: Calendar,
            gradient: 'from-blue-500 to-blue-600',
            path: '/admin/events'
        },
        {
            title: 'Volunteer Matching',
            description: 'Match volunteers to events',
            buttonText: 'Start Matching',
            icon: Users,
            gradient: 'from-green-500 to-green-600',
            path: '/admin/matching'
        },
        {
            title: 'Volunteer History',
            description: 'View volunteer participation records',
            buttonText: 'View History',
            icon: ClipboardList,
            gradient: 'from-primary-500 to-primary-600',
            path: '/volunteer/history'
        }
    ];

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6 transition-all hover:shadow-lg">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
                            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Events</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{dashboardStats.totalEvents}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-6 transition-all hover:shadow-lg">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
                            <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Volunteers</p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{dashboardStats.totalVolunteers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 transition-all hover:shadow-lg">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-800 rounded-lg">
                            <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Active Events</p>
                            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{dashboardStats.activeEvents}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl p-6 transition-all hover:shadow-lg">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-lg">
                            <ClipboardList className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Pending Matches</p>
                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{dashboardStats.pendingMatches}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Welcome message */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white shadow-lg">
                <h2 className="text-2xl font-bold mb-2">Welcome back, {currentUser}!</h2>
                <p className="text-primary-100">Here's what's happening with your volunteer management platform today.</p>
            </div>
        </div>
    );

    const renderQuickActions = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickActionButtons.map((action, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-xl transition-all duration-300 group">
                        <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{action.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{action.description}</p>
                        <Link
                            to={action.path}
                            className={`inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${action.gradient} text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity`}
                        >
                            <span>{action.buttonText}</span>
                            <ArrowRight size={16} />
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
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {combinedActivities.length === 0 ? (
                            <div className="px-6 py-8 text-center">
                                <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                            </div>
                        ) : (
                            combinedActivities.slice(0, 8).map((activity) => (
                                <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                                            {activity.name && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{activity.name}</p>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="px-4 py-4 sm:px-0 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage volunteers and events</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Logged in as:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{currentUser}</span>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="divide-y divide-gray-200 dark:divide-gray-700 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x">
                            {/* Sidebar */}
                            <aside className="py-6 lg:col-span-3">
                                <nav className="space-y-1">
                                    <div className="px-6 mb-6">
                                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Navigation</h2>
                                    </div>
                                    {sidebarItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveSection(item.id)}
                                            className={`${
                                                activeSection === item.id
                                                    ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-400'
                                                    : 'border-transparent text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                            } group border-l-4 px-6 py-3 flex items-center text-sm font-medium w-full text-left transition-colors`}
                                        >
                                            <span className="truncate">{item.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </aside>

                            {/* Main content */}
                            <div className="divide-y divide-gray-200 dark:divide-gray-700 lg:col-span-9">
                                <div className="py-6 px-4 sm:p-6 lg:pb-8">
                                    <div className="mb-8">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
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