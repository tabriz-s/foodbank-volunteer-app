const express = require('express');
const router = express.Router();
const { validateEvent } = require('../middleware/EventValidation');
const {
    getAllEvents,
    getEventById,
    getEventsByStatus,
    createEvent,
    updateEvent,
    deleteEvent
} = require('../controllers/EventController');


///api/events -get all events
router.get('/', getAllEvents);

//api/events/status -get events by status
router.get('/status', getEventsByStatus);

//api/events/:id - get event by ID
router.get('/:id', getEventById);


//api/events - Create new event 
router.post('/', validateEvent, createEvent);


// api/events/:id - Update event
router.put('/:id', validateEvent, updateEvent);

//api/events/:id - Delete event
router.delete('/:id', deleteEvent);

module.exports = router;
