const AdminModel = require('../models/AdminModel');

//get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const stats = AdminModel.getDashboardStats();

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

//get recent activities
const getRecentActivities = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const activities = AdminModel.getRecentActivities(limit);

        res.status(200).json({
            success: true,
            count: activities.length,
            data: activities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getRecentActivities
};