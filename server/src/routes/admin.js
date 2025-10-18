const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getRecentActivities
} = require('../controllers/AdminController');

///api/admin/dashboard - gets dashboard statistics
router.get('/dashboard', getDashboardStats);

///api/admin/activities -gets recent activities
router.get('/activities', getRecentActivities);

module.exports = router;
