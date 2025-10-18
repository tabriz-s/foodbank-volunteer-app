//mock data for admin dashboard activities
let recentActivities = [
    { 
        id: 1, 
        action: 'New volunteer registered', 
        name: 'Tadiwa K', 
        time: '1 hour ago',
        timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    { 
        id: 2, 
        action: 'Event created', 
        name: 'UH Food Bank Distribution', 
        time: '3 hours ago',
        timestamp: new Date(Date.now() - 10800000).toISOString()
    },
    { 
        id: 3, 
        action: 'Volunteer matched to event', 
        name: 'Javier A → Houston Food Bank Cleanup', 
        time: '5 hours ago',
        timestamp: new Date(Date.now() - 18000000).toISOString()
    },
    { 
        id: 4, 
        action: 'Event updated', 
        name: 'UH Community Outreach', 
        time: '1 day ago',
        timestamp: new Date(Date.now() - 86400000).toISOString()
    },
    { 
        id: 5, 
        action: 'Volunteer profile updated', 
        name: 'Mohamed U', 
        time: '2 days ago',
        timestamp: new Date(Date.now() - 172800000).toISOString()
    }
];

let activityIdCounter = 6;


//get all recent activities
const getRecentActivities = (limit = 10) => {
    return recentActivities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
};

//get dashboard statistics
const getDashboardStats = () => {
    const EventModel = require('./EventModel');
    const VolunteerModel = require('./VolunteerModel');
    
    const totalEvents = EventModel.countTotalEvents();
    const activeEvents = EventModel.countEventsByStatus('active');
    const upcomingEvents = EventModel.countEventsByStatus('upcoming');
    const totalVolunteers = VolunteerModel.getAllVolunteers().length;
    
    //calculate pending matches (mock value for now)
    const pendingMatches = 5;
    
    return {
        totalEvents,
        totalVolunteers,
        activeEvents,
        upcomingEvents,
        pendingMatches
    };
};

//adding new activity
const addActivity = (action, name) => {
    const newActivity = {
        id: activityIdCounter++,
        action,
        name,
        time: 'Just now',
        timestamp: new Date().toISOString()
    };
    
    recentActivities.unshift(newActivity);
    
    //keeps only last 50 activities
    if (recentActivities.length > 50) {
        recentActivities = recentActivities.slice(0, 50);
    }
    
    return newActivity;
};


//Clear out old activities(older than 30 days)
const clearOldActivities = () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const beforeCount = recentActivities.length;
    
    recentActivities = recentActivities.filter(
        activity => new Date(activity.timestamp) >= thirtyDaysAgo
    );
    
    return beforeCount - recentActivities.length;
};

module.exports = {
    getRecentActivities,
    getDashboardStats,
    addActivity,
    clearOldActivities
};