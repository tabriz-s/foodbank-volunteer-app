const express = require('express');
const router = express.Router();
const { validateEventCreate, validateEventUpdate } = require('../middleware/EventValidation');

// Mock data controllers
const {
    getAllEvents,
    getEventById,
    getEventsByStatus,
    createEvent,
    updateEvent,
    deleteEvent
} = require('../controllers/EventController');

// Database controllers
const {
    getAllEventsDB,
    getEventByIdDB,
    getEventsByStatusDB,
    getEventsByUrgencyDB,
    getUpcomingEventsDB,
    createEventDB,
    updateEventDB,
    deleteEventDB
} = require('../controllers/EventControllerDB');


// Real Routes

router.get('/db', getAllEventsDB);
router.get('/db/status', getEventsByStatusDB);
router.get('/db/urgency', getEventsByUrgencyDB);
router.get('/db/upcoming', getUpcomingEventsDB);
router.get('/db/:id', getEventByIdDB);
router.post('/db', validateEventCreate, createEventDB);
router.put('/db/:id', validateEventUpdate, updateEventDB);
router.delete('/db/:id', deleteEventDB);


// OLD MOCK ROUTES
router.get('/', getAllEvents);
router.get('/status', getEventsByStatus);
router.get('/:id', getEventById);
router.post('/', validateEventCreate, createEvent);
router.put('/:id', validateEventUpdate, updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
