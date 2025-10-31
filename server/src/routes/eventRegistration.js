const express = require('express');
const router = express.Router();
const EventRegistrationController = require('../controllers/EventRegistrationController');

/* 
===============================================
    EVENT BROWSING ROUTES 
===============================================
*/

// GET /api/event-registration/available?volunteer_id=X
// Section 1: Get events volunteer qualifies for
router.get('/available', EventRegistrationController.getAvailableEvents);

// GET /api/event-registration/other?volunteer_id=X
// Section 2: Get events volunteer doesn't qualify for (can share with others)
router.get('/other', EventRegistrationController.getOtherEvents);

// GET /api/event-registration/my-events?volunteer_id=X
// Section 3: Get events volunteer is registered for
router.get('/my-events', EventRegistrationController.getMyEvents);

/* 
===============================================
    EVENT DETAILS ROUTES
===============================================
*/

// GET /api/event-registration/event/:event_id?volunteer_id=X
// Get single event details with eligibility check
router.get('/event/:event_id', EventRegistrationController.getEventDetails);

// GET /api/event-registration/event/:event_id/skills?volunteer_id=X
// Get available skill slots for an event
router.get('/event/:event_id/skills', EventRegistrationController.getSkillAvailability);

/* 
===============================================
    REGISTRATION ACTIONS FOR VOLUNTEERS
===============================================
*/

// POST /api/event-registration/register
// Register for an event with specific skill role
// Body: { volunteer_id, event_id, registered_skill_id }
router.post('/register', EventRegistrationController.registerForEvent);

// DELETE /api/event-registration/unregister/:signup_id
// Unregister from an event
// Body: { volunteer_id }
router.delete('/unregister/:signup_id', EventRegistrationController.unregisterFromEvent);

// ==============================================

module.exports = router;