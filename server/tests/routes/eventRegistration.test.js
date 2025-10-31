const request = require('supertest');
const express = require('express');
const eventRegistrationRoutes = require('../../src/routes/eventRegistration');
const EventRegistrationController = require('../../src/controllers/EventRegistrationController');

// Mock the controller
jest.mock('../../src/controllers/EventRegistrationController');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/event-registration', eventRegistrationRoutes);

describe('Event Registration Routes', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ============================================
    // GET /api/event-registration/available
    // ============================================

    describe('GET /api/event-registration/available', () => {
        test('should route to getAvailableEvents controller', async () => {
            EventRegistrationController.getAvailableEvents.mockImplementation((req, res) => {
                res.status(200).json({ success: true, data: [] });
            });

            const response = await request(app)
                .get('/api/event-registration/available')
                .query({ volunteer_id: 7 });

            expect(response.status).toBe(200);
            expect(EventRegistrationController.getAvailableEvents).toHaveBeenCalled();
        });

        test('should pass query parameters to controller', async () => {
            EventRegistrationController.getAvailableEvents.mockImplementation((req, res) => {
                expect(req.query.volunteer_id).toBe('7');
                res.status(200).json({ success: true });
            });

            await request(app)
                .get('/api/event-registration/available')
                .query({ volunteer_id: 7 });

            expect(EventRegistrationController.getAvailableEvents).toHaveBeenCalled();
        });
    });

    // ============================================
    // GET /api/event-registration/other
    // ============================================

    describe('GET /api/event-registration/other', () => {
        test('should route to getOtherEvents controller', async () => {
            EventRegistrationController.getOtherEvents.mockImplementation((req, res) => {
                res.status(200).json({ success: true, data: [] });
            });

            const response = await request(app)
                .get('/api/event-registration/other')
                .query({ volunteer_id: 7 });

            expect(response.status).toBe(200);
            expect(EventRegistrationController.getOtherEvents).toHaveBeenCalled();
        });
    });

    // ============================================
    // GET /api/event-registration/my-events
    // ============================================

    describe('GET /api/event-registration/my-events', () => {
        test('should route to getMyEvents controller', async () => {
            EventRegistrationController.getMyEvents.mockImplementation((req, res) => {
                res.status(200).json({ success: true, data: [] });
            });

            const response = await request(app)
                .get('/api/event-registration/my-events')
                .query({ volunteer_id: 7 });

            expect(response.status).toBe(200);
            expect(EventRegistrationController.getMyEvents).toHaveBeenCalled();
        });
    });

    // ============================================
    // GET /api/event-registration/event/:event_id
    // ============================================

    describe('GET /api/event-registration/event/:event_id', () => {
        test('should route to getEventDetails controller', async () => {
            EventRegistrationController.getEventDetails.mockImplementation((req, res) => {
                res.status(200).json({ success: true, data: {} });
            });

            const response = await request(app)
                .get('/api/event-registration/event/1')
                .query({ volunteer_id: 7 });

            expect(response.status).toBe(200);
            expect(EventRegistrationController.getEventDetails).toHaveBeenCalled();
        });

        test('should pass event_id as route parameter', async () => {
            EventRegistrationController.getEventDetails.mockImplementation((req, res) => {
                expect(req.params.event_id).toBe('1');
                res.status(200).json({ success: true });
            });

            await request(app)
                .get('/api/event-registration/event/1')
                .query({ volunteer_id: 7 });

            expect(EventRegistrationController.getEventDetails).toHaveBeenCalled();
        });

        test('should handle different event IDs', async () => {
            EventRegistrationController.getEventDetails.mockImplementation((req, res) => {
                expect(req.params.event_id).toBe('42');
                res.status(200).json({ success: true });
            });

            await request(app)
                .get('/api/event-registration/event/42');

            expect(EventRegistrationController.getEventDetails).toHaveBeenCalled();
        });
    });

    // ============================================
    // GET /api/event-registration/event/:event_id/skills
    // ============================================

    describe('GET /api/event-registration/event/:event_id/skills', () => {
        test('should route to getSkillAvailability controller', async () => {
            EventRegistrationController.getSkillAvailability.mockImplementation((req, res) => {
                res.status(200).json({ success: true, data: [] });
            });

            const response = await request(app)
                .get('/api/event-registration/event/1/skills')
                .query({ volunteer_id: 7 });

            expect(response.status).toBe(200);
            expect(EventRegistrationController.getSkillAvailability).toHaveBeenCalled();
        });

        test('should pass event_id as route parameter', async () => {
            EventRegistrationController.getSkillAvailability.mockImplementation((req, res) => {
                expect(req.params.event_id).toBe('5');
                res.status(200).json({ success: true });
            });

            await request(app)
                .get('/api/event-registration/event/5/skills')
                .query({ volunteer_id: 7 });

            expect(EventRegistrationController.getSkillAvailability).toHaveBeenCalled();
        });
    });

    // ============================================
    // POST /api/event-registration/register
    // ============================================

    describe('POST /api/event-registration/register', () => {
        test('should route to registerForEvent controller', async () => {
            EventRegistrationController.registerForEvent.mockImplementation((req, res) => {
                res.status(201).json({ success: true, data: {} });
            });

            const response = await request(app)
                .post('/api/event-registration/register')
                .send({
                    volunteer_id: 7,
                    event_id: 1,
                    registered_skill_id: 1
                });

            expect(response.status).toBe(201);
            expect(EventRegistrationController.registerForEvent).toHaveBeenCalled();
        });

        test('should pass request body to controller', async () => {
            EventRegistrationController.registerForEvent.mockImplementation((req, res) => {
                expect(req.body.volunteer_id).toBe(7);
                expect(req.body.event_id).toBe(1);
                expect(req.body.registered_skill_id).toBe(1);
                res.status(201).json({ success: true });
            });

            await request(app)
                .post('/api/event-registration/register')
                .send({
                    volunteer_id: 7,
                    event_id: 1,
                    registered_skill_id: 1
                });

            expect(EventRegistrationController.registerForEvent).toHaveBeenCalled();
        });

        test('should handle registration without skill (no skills required)', async () => {
            EventRegistrationController.registerForEvent.mockImplementation((req, res) => {
                expect(req.body.registered_skill_id).toBeNull();
                res.status(201).json({ success: true });
            });

            await request(app)
                .post('/api/event-registration/register')
                .send({
                    volunteer_id: 7,
                    event_id: 2,
                    registered_skill_id: null
                });

            expect(EventRegistrationController.registerForEvent).toHaveBeenCalled();
        });

        test('should accept JSON content type', async () => {
            EventRegistrationController.registerForEvent.mockImplementation((req, res) => {
                res.status(201).json({ success: true });
            });

            const response = await request(app)
                .post('/api/event-registration/register')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify({
                    volunteer_id: 7,
                    event_id: 1,
                    registered_skill_id: 1
                }));

            expect(response.status).toBe(201);
        });
    });

    // ============================================
    // DELETE /api/event-registration/unregister/:signup_id
    // ============================================

    describe('DELETE /api/event-registration/unregister/:signup_id', () => {
        test('should route to unregisterFromEvent controller', async () => {
            EventRegistrationController.unregisterFromEvent.mockImplementation((req, res) => {
                res.status(200).json({ success: true, message: 'Unregistered' });
            });

            const response = await request(app)
                .delete('/api/event-registration/unregister/1')
                .send({ volunteer_id: 7 });

            expect(response.status).toBe(200);
            expect(EventRegistrationController.unregisterFromEvent).toHaveBeenCalled();
        });

        test('should pass signup_id as route parameter', async () => {
            EventRegistrationController.unregisterFromEvent.mockImplementation((req, res) => {
                expect(req.params.signup_id).toBe('1');
                res.status(200).json({ success: true });
            });

            await request(app)
                .delete('/api/event-registration/unregister/1')
                .send({ volunteer_id: 7 });

            expect(EventRegistrationController.unregisterFromEvent).toHaveBeenCalled();
        });

        test('should handle different signup IDs', async () => {
            EventRegistrationController.unregisterFromEvent.mockImplementation((req, res) => {
                expect(req.params.signup_id).toBe('99');
                res.status(200).json({ success: true });
            });

            await request(app)
                .delete('/api/event-registration/unregister/99')
                .send({ volunteer_id: 7 });

            expect(EventRegistrationController.unregisterFromEvent).toHaveBeenCalled();
        });

        test('should pass volunteer_id in request body', async () => {
            EventRegistrationController.unregisterFromEvent.mockImplementation((req, res) => {
                expect(req.body.volunteer_id).toBe(7);
                res.status(200).json({ success: true });
            });

            await request(app)
                .delete('/api/event-registration/unregister/1')
                .send({ volunteer_id: 7 });

            expect(EventRegistrationController.unregisterFromEvent).toHaveBeenCalled();
        });
    });

    // ============================================
    // Route Not Found
    // ============================================

    describe('Route Not Found', () => {
        test('should return 404 for undefined routes', async () => {
            const response = await request(app)
                .get('/api/event-registration/nonexistent');

            expect(response.status).toBe(404);
        });

        test('should return 404 for invalid POST routes', async () => {
            const response = await request(app)
                .post('/api/event-registration/invalid')
                .send({});

            expect(response.status).toBe(404);
        });
    });

    // ============================================
    // HTTP Method Validation
    // ============================================

    describe('HTTP Method Validation', () => {
        test('should not allow POST on GET-only routes', async () => {
            const response = await request(app)
                .post('/api/event-registration/available')
                .send({});

            expect(response.status).toBe(404);
        });

        test('should not allow GET on POST-only routes', async () => {
            const response = await request(app)
                .get('/api/event-registration/register');

            expect(response.status).toBe(404);
        });

        test('should not allow PUT on DELETE route', async () => {
            const response = await request(app)
                .put('/api/event-registration/unregister/1')
                .send({});

            expect(response.status).toBe(404);
        });
    });

    // ============================================
    // Integration - Full Flow
    // ============================================

    describe('Integration - Route Flow', () => {
        test('should handle complete registration flow', async () => {
            // Mock all controllers for a typical flow
            EventRegistrationController.getAvailableEvents.mockImplementation((req, res) => {
                res.status(200).json({ success: true, data: [{ Event_id: 1 }] });
            });

            EventRegistrationController.getEventDetails.mockImplementation((req, res) => {
                res.status(200).json({ success: true, data: { Event_id: 1 } });
            });

            EventRegistrationController.getSkillAvailability.mockImplementation((req, res) => {
                res.status(200).json({ success: true, data: [] });
            });

            EventRegistrationController.registerForEvent.mockImplementation((req, res) => {
                res.status(201).json({ success: true });
            });

            // Step 1: Get available events
            const step1 = await request(app)
                .get('/api/event-registration/available')
                .query({ volunteer_id: 7 });
            expect(step1.status).toBe(200);

            // Step 2: Get event details
            const step2 = await request(app)
                .get('/api/event-registration/event/1')
                .query({ volunteer_id: 7 });
            expect(step2.status).toBe(200);

            // Step 3: Check skill availability
            const step3 = await request(app)
                .get('/api/event-registration/event/1/skills')
                .query({ volunteer_id: 7 });
            expect(step3.status).toBe(200);

            // Step 4: Register
            const step4 = await request(app)
                .post('/api/event-registration/register')
                .send({ volunteer_id: 7, event_id: 1, registered_skill_id: 1 });
            expect(step4.status).toBe(201);

            // Verify all controllers were called
            expect(EventRegistrationController.getAvailableEvents).toHaveBeenCalled();
            expect(EventRegistrationController.getEventDetails).toHaveBeenCalled();
            expect(EventRegistrationController.getSkillAvailability).toHaveBeenCalled();
            expect(EventRegistrationController.registerForEvent).toHaveBeenCalled();
        });
    });
});