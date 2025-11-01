const EventDB = require('../models/EventModelDB');
const VolunteerDB = require('../models/VolunteerModelDB');

// Admin ops

// GET dashboard statistics from database
const getDashboardStatsDB = async (req, res) => {
    try {
        const totalEvents = await EventDB.countTotalEvents();
        const activeEvents = await EventDB.countEventsByStatus('active');
        const upcomingEvents = await EventDB.countEventsByStatus('planned');
        
        // Get total volunteers
        const volunteers = await VolunteerDB.getAllVolunteers();
        const totalVolunteers = volunteers.length;
        
        // Calculate pending matches (TODO: mock value for now can be updated later)
        const pendingMatches = 5;
        
        const stats = {
            totalEvents,
            totalVolunteers,
            activeEvents,
            upcomingEvents,
            pendingMatches
        };
        
        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            data: stats
        });
    } catch (error) {
        console.error('Error in getDashboardStatsDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard stats from database',
            error: error.message
        });
    }
};

// GET recent activities from database
const getRecentActivitiesDB = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        
        // For now, return mock activities
        const activities = [
            { 
                id: 1, 
                action: 'New volunteer registered', 
                name: 'Recent User', 
                time: '1 hour ago'
            },
            { 
                id: 2, 
                action: 'Event created', 
                name: 'New Event', 
                time: '3 hours ago'
            }
        ];
        
        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            count: activities.length,
            data: activities.slice(0, limit)
        });
    } catch (error) {
        console.error('Error in getRecentActivitiesDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve recent activities from database',
            error: error.message
        });
    }
};


module.exports = {
    getDashboardStatsDB,
    getRecentActivitiesDB
};
