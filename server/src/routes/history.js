const express = require('express');
const router = express.Router();
const { getVolunteerHistoryById } = require('../controllers/HistoryController');

// GET /api/volunteers/:id/history
router.get('/volunteers/:id/history', getVolunteerHistoryById);

module.exports = router;
