const express = require('express');
const router = express.Router();

// Mock data controllers
const {
    getDashboardStats,
    getRecentActivities
} = require('../controllers/AdminController');

// Database controllers
const {
    getDashboardStatsDB,
    getRecentActivitiesDB
} = require('../controllers/AdminControllerDB');

// MOCK
router.get('/dashboard', getDashboardStats);
router.get('/activities', getRecentActivities);

// REAL Routes
router.get('/db/dashboard', getDashboardStatsDB);
router.get('/db/activities', getRecentActivitiesDB);

module.exports = router;
