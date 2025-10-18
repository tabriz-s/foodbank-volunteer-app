const express = require('express');
const router = express.Router();
const {
    getVolunteerHistoryById,
    assignVolunteerToEvent,
    updateEventHistory,
    deleteEventHistory,
} = require('../controllers/HistoryController');
const { mockAuth } = require('../middleware/AuthMiddleware');

// Volunteer history routes
router.get('/volunteers/:id/history', mockAuth, getVolunteerHistoryById);
router.post('/volunteers/:id/history', mockAuth, assignVolunteerToEvent);

// Event-linked routes
router.put('/events/:eventId/history', mockAuth, updateEventHistory);
router.delete('/events/:eventId/history', mockAuth, deleteEventHistory);

module.exports = router;
