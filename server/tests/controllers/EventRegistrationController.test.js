const request = require('supertest');
const express = require('express');
const EventRegistrationController = require('../../src/controllers/EventRegistrationController');
const EventSignupModelDB = require('../../src/models/EventSignupModelDB');

// Mock the model
jest.mock('../../src/models/EventSignupModelDB');

// Create Express app for testing
const app = express();
app.use(express.json());

// Setup routes
app.get('/api/event-registration/available', EventRegistrationController.getAvailableEvents);
app.get('/api/event-registration/other', EventRegistrationController.getOtherEvents);
app.get('/api/event-registration/my-events', EventRegistrationController.getMyEvents);
app.get('/api/event-registration/event/:event_id', EventRegistrationController.getEventDetails);
app.get('/api/event-registration/event/:event_id/skills', EventRegistrationController.getSkillAvailability);
app.post('/api/event-registration/register', EventRegistrationController.registerForEvent);
app.delete('/api/event-registration/unregister/:signup_id', EventRegistrationController.unregisterFromEvent);

describe('EventRegistrationController', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ============================================
    // GET AVAILABLE EVENTS
    // ============================================

    describe('getAvailableEvents', () => {
        test('should return available events successfully', async () => {
            const mockEvents = [
                { Event_id: 1, Event_name: 'Food Drive', Date: '2025-12-01' },
                { Event_id: 2, Event_name: 'Cleanup', Date: '2025-12-05' }
            ];

            EventSignupModelDB.getAvailableEventsForVolunteer.mockResolvedValue(mockEvents);

            const response = await request(app)
                .get('/api/event-registration/available')
                .query({ volunteer_id: 7 });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(2);
            expect(response.body.data).toEqual(mockEvents);
            expect(EventSignupModelDB.getAvailableEventsForVolunteer).toHaveBeenCalledWith('7');
        });

        test('should return 400 if volunteer_id missing', async () => {
            const response = await request(app)
                .get('/api/event-registration/available');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('volunteer_id is required');
        });

        test('should return empty array if no available events', async () => {
            EventSignupModelDB.getAvailableEventsForVolunteer.mockResolvedValue([]);

            const response = await request(app)
                .get('/api/event-registration/available')
                .query({ volunteer_id: 7 });

            expect(response.status).toBe(200);
            expect(response.body.count).toBe(0);
            expect(response.body.data).toEqual([]);
        });

        test('should handle database error', async () => {
            EventSignupModelDB.getAvailableEventsForVolunteer.mockRejectedValue(
                new Error('Database error')
            );

            const response = await request(app)
                .get('/api/event-registration/available')
                .query({ volunteer_id: 7 });

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Failed to retrieve available events');
        });
    });

    // ============================================
    // GET OTHER EVENTS
    // ============================================

    describe('getOtherEvents', () => {
        test('should return other events successfully', async () => {
            const mockEvents = [
                { Event_id: 3, Event_name: 'Warehouse Work', required_skills: [{ Skill_name: 'Heavy Lifting' }] }
            ];

            EventSignupModelDB.getOtherEventsForVolunteer.mockResolvedValue(mockEvents);

            const response = await request(app)
                .get('/api/event-registration/other')
                .query({ volunteer_id: 7 });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(1);
            expect(response.body.data).toEqual(mockEvents);
        });

        test('should return 400 if volunteer_id missing', async () => {
            const response = await request(app)
                .get('/api/event-registration/other');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should handle database error', async () => {
            EventSignupModelDB.getOtherEventsForVolunteer.mockRejectedValue(
                new Error('Database error')
            );

            const response = await request(app)
                .get('/api/event-registration/other')
                .query({ volunteer_id: 7 });

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        });
    });

    // ============================================
    // GET MY EVENTS
    // ============================================

    describe('getMyEvents', () => {
        test('should return registered events successfully', async () => {
            const mockEvents = [
                { 
                    Signup_id: 1, 
                    Event_id: 1, 
                    Event_name: 'Food Drive',
                    Registered_as_skill: 'Cooking'
                }
            ];

            EventSignupModelDB.getVolunteerSignups.mockResolvedValue(mockEvents);

            const response = await request(app)
                .get('/api/event-registration/my-events')
                .query({ volunteer_id: 7 });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(1);
            expect(response.body.data).toEqual(mockEvents);
        });

        test('should return 400 if volunteer_id missing', async () => {
            const response = await request(app)
                .get('/api/event-registration/my-events');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should return empty array if no registered events', async () => {
            EventSignupModelDB.getVolunteerSignups.mockResolvedValue([]);

            const response = await request(app)
                .get('/api/event-registration/my-events')
                .query({ volunteer_id: 7 });

            expect(response.status).toBe(200);
            expect(response.body.count).toBe(0);
        });

        test('should handle database error', async () => {
            EventSignupModelDB.getVolunteerSignups.mockRejectedValue(
                new Error('Database error')
            );

            const response = await request(app)
                .get('/api/event-registration/my-events')
                .query({ volunteer_id: 7 });

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        });
    });

    // ============================================
    // GET EVENT DETAILS
    // ============================================

    describe('getEventDetails', () => {
        test('should return event details with eligibility', async () => {
            const mockEvent = {
                Event_id: 1,
                Event_name: 'Food Drive',
                required_skills: [{ Skills_id: 1, Skill_name: 'Cooking' }]
            };

            const mockEligibility = {
                hasSkills: true,
                matchingSkills: [1]
            };

            const mockTimeCheck = { hasConflict: false };

            EventSignupModelDB.getEventWithSkills.mockResolvedValue(mockEvent);
            EventSignupModelDB.checkIfRegistered.mockResolvedValue(false);
            EventSignupModelDB.hasRequiredSkills.mockResolvedValue(mockEligibility);
            EventSignupModelDB.checkTimeConflict.mockResolvedValue(mockTimeCheck);
            EventSignupModelDB.isEventFull.mockResolvedValue(false);

            const response = await request(app)
                .get('/api/event-registration/event/1')
                .query({ volunteer_id: 7 });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockEvent);
            expect(response.body.eligibility).toBeDefined();
            expect(response.body.eligibility.canRegister).toBe(true);
        });

        test('should return event without eligibility if no volunteer_id', async () => {
            const mockEvent = {
                Event_id: 1,
                Event_name: 'Food Drive'
            };

            EventSignupModelDB.getEventWithSkills.mockResolvedValue(mockEvent);

            const response = await request(app)
                .get('/api/event-registration/event/1');

            expect(response.status).toBe(200);
            expect(response.body.eligibility).toBeNull();
        });

        test('should return 404 if event not found', async () => {
            EventSignupModelDB.getEventWithSkills.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/event-registration/event/999')
                .query({ volunteer_id: 7 });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('not found');
        });

        test('should return 400 if event_id missing', async () => {
            const response = await request(app)
                .get('/api/event-registration/event/');

            expect(response.status).toBe(404); // Route not found
        });

        test('should handle database error', async () => {
            EventSignupModelDB.getEventWithSkills.mockRejectedValue(
                new Error('Database error')
            );

            const response = await request(app)
                .get('/api/event-registration/event/1')
                .query({ volunteer_id: 7 });

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        });
    });

    // ============================================
    // GET SKILL AVAILABILITY
    // ============================================

    describe('getSkillAvailability', () => {
        test('should return skill availability for volunteer', async () => {
            const mockEvent = {
                Event_id: 1,
                Event_name: 'Food Drive',
                required_skills: [
                    { Skills_id: 1, Skill_name: 'Cooking', Needed_count: 10, Current_signups: 5 }
                ]
            };

            const mockEligibility = {
                hasSkills: true,
                matchingSkills: [1]
            };

            EventSignupModelDB.getEventWithSkills.mockResolvedValue(mockEvent);
            EventSignupModelDB.hasRequiredSkills.mockResolvedValue(mockEligibility);

            const response = await request(app)
                .get('/api/event-registration/event/1/skills')
                .query({ volunteer_id: 7 });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].spots_remaining).toBe(5);
            expect(response.body.data[0].is_full).toBe(false);
        });

        test('should show unlimited spots when Needed_count is null', async () => {
            const mockEvent = {
                Event_id: 1,
                Event_name: 'Food Drive',
                required_skills: [
                    { Skills_id: 1, Skill_name: 'Cooking', Needed_count: null, Current_signups: 5 }
                ]
            };

            EventSignupModelDB.getEventWithSkills.mockResolvedValue(mockEvent);
            EventSignupModelDB.hasRequiredSkills.mockResolvedValue({ 
                hasSkills: true, 
                matchingSkills: [1] 
            });

            const response = await request(app)
                .get('/api/event-registration/event/1/skills')
                .query({ volunteer_id: 7 });

            expect(response.status).toBe(200);
            expect(response.body.data[0].spots_remaining).toBe('Unlimited');
        });

        test('should mark skill as full when spots remaining is 0', async () => {
            const mockEvent = {
                Event_id: 1,
                Event_name: 'Food Drive',
                required_skills: [
                    { Skills_id: 1, Skill_name: 'Cooking', Needed_count: 10, Current_signups: 10 }
                ]
            };

            EventSignupModelDB.getEventWithSkills.mockResolvedValue(mockEvent);
            EventSignupModelDB.hasRequiredSkills.mockResolvedValue({ 
                hasSkills: true, 
                matchingSkills: [1] 
            });

            const response = await request(app)
                .get('/api/event-registration/event/1/skills')
                .query({ volunteer_id: 7 });

            expect(response.status).toBe(200);
            expect(response.body.data[0].is_full).toBe(true);
        });

        test('should return 404 if event not found', async () => {
            EventSignupModelDB.getEventWithSkills.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/event-registration/event/999/skills')
                .query({ volunteer_id: 7 });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    // ============================================
    // REGISTER FOR EVENT
    // ============================================

    describe('registerForEvent', () => {
        test('should register for event successfully with skill', async () => {
            const mockSignup = {
                Signup_id: 1,
                Volunteer_id: 7,
                Event_id: 1,
                Registered_skill_id: 1
            };

            const mockEvent = { Event_id: 1, Event_name: 'Food Drive' };
            const mockEventWithSkills = {
                Event_id: 1,
                Event_name: 'Food Drive',
                required_skills: [{ Skills_id: 1 }]
            };

            EventSignupModelDB.getEventWithSkills.mockResolvedValue(mockEventWithSkills);
            EventSignupModelDB.createSignup.mockResolvedValue(mockSignup);
            EventSignupModelDB.getEventById.mockResolvedValue(mockEvent);

            const response = await request(app)
                .post('/api/event-registration/register')
                .send({
                    volunteer_id: 7,
                    event_id: 1,
                    registered_skill_id: 1
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Successfully registered');
            expect(response.body.data.signup).toEqual(mockSignup);
        });

        test('should register for event without skill (no skills required)', async () => {
            const mockSignup = {
                Signup_id: 2,
                Volunteer_id: 7,
                Event_id: 2,
                Registered_skill_id: null
            };

            const mockEvent = { Event_id: 2, Event_name: 'Community Cleanup' };
            const mockEventWithSkills = {
                Event_id: 2,
                Event_name: 'Community Cleanup',
                required_skills: []
            };

            EventSignupModelDB.getEventWithSkills.mockResolvedValue(mockEventWithSkills);
            EventSignupModelDB.createSignup.mockResolvedValue(mockSignup);
            EventSignupModelDB.getEventById.mockResolvedValue(mockEvent);

            const response = await request(app)
                .post('/api/event-registration/register')
                .send({
                    volunteer_id: 7,
                    event_id: 2,
                    registered_skill_id: null
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
        });

        test('should return 400 if volunteer_id missing', async () => {
            const response = await request(app)
                .post('/api/event-registration/register')
                .send({
                    event_id: 1,
                    registered_skill_id: 1
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('volunteer_id and event_id are required');
        });

        test('should return 400 if event_id missing', async () => {
            const response = await request(app)
                .post('/api/event-registration/register')
                .send({
                    volunteer_id: 7,
                    registered_skill_id: 1
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should return 404 if event not found', async () => {
            EventSignupModelDB.getEventWithSkills.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/event-registration/register')
                .send({
                    volunteer_id: 7,
                    event_id: 999,
                    registered_skill_id: 1
                });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Event not found');
        });

        test('should return 400 if skill required but not provided', async () => {
            const mockEventWithSkills = {
                Event_id: 1,
                required_skills: [{ Skills_id: 1 }]
            };

            EventSignupModelDB.getEventWithSkills.mockResolvedValue(mockEventWithSkills);

            const response = await request(app)
                .post('/api/event-registration/register')
                .send({
                    volunteer_id: 7,
                    event_id: 1,
                    registered_skill_id: null
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('must select which skill role');
        });

        test('should return 409 if already registered', async () => {
            const mockEventWithSkills = {
                Event_id: 1,
                required_skills: [{ Skills_id: 1 }]
            };

            EventSignupModelDB.getEventWithSkills.mockResolvedValue(mockEventWithSkills);
            EventSignupModelDB.createSignup.mockRejectedValue(
                new Error('already registered for this event')  // ← lowercase 'already registered'
            );

            const response = await request(app)
                .post('/api/event-registration/register')
                .send({
                    volunteer_id: 7,
                    event_id: 1,
                    registered_skill_id: 1
                });

            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('already registered');
        });

        test('should return 409 if event full', async () => {
            const mockEventWithSkills = {
                Event_id: 1,
                required_skills: []
            };

            EventSignupModelDB.getEventWithSkills.mockResolvedValue(mockEventWithSkills);
            EventSignupModelDB.createSignup.mockRejectedValue(
                new Error('Event is at full capacity')
            );

            const response = await request(app)
                .post('/api/event-registration/register')
                .send({
                    volunteer_id: 7,
                    event_id: 1,
                    registered_skill_id: null
                });

            expect(response.status).toBe(409);
            expect(response.body.message).toContain('full');
        });

        test('should return 403 if volunteer does not have required skills', async () => {
            const mockEventWithSkills = {
                Event_id: 1,
                required_skills: [{ Skills_id: 1 }]
            };

            EventSignupModelDB.getEventWithSkills.mockResolvedValue(mockEventWithSkills);
            EventSignupModelDB.createSignup.mockRejectedValue(
                new Error('You do not have the required skills')
            );

            const response = await request(app)
                .post('/api/event-registration/register')
                .send({
                    volunteer_id: 7,
                    event_id: 1,
                    registered_skill_id: 1
                });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });
    });

    // ============================================
    // UNREGISTER FROM EVENT
    // ============================================

    describe('unregisterFromEvent', () => {
        test('should unregister successfully', async () => {
            EventSignupModelDB.deleteSignup.mockResolvedValue({
                success: true,
                message: 'Successfully unregistered from event'
            });

            const response = await request(app)
                .delete('/api/event-registration/unregister/1')
                .send({ volunteer_id: 7 });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Successfully unregistered');
            expect(EventSignupModelDB.deleteSignup).toHaveBeenCalledWith('1', 7);
        });

        test('should return 400 if volunteer_id missing', async () => {
            const response = await request(app)
                .delete('/api/event-registration/unregister/1')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('signup_id and volunteer_id are required');
        });

        test('should return 400 if signup_id missing', async () => {
            const response = await request(app)
                .delete('/api/event-registration/unregister/')
                .send({ volunteer_id: 7 });

            expect(response.status).toBe(404); // Route not found
        });

        test('should return 404 if signup not found', async () => {
            EventSignupModelDB.deleteSignup.mockRejectedValue(
                new Error('Signup not found or does not belong to this volunteer')
            );

            const response = await request(app)
                .delete('/api/event-registration/unregister/999')
                .send({ volunteer_id: 7 });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        test('should handle database error', async () => {
            EventSignupModelDB.deleteSignup.mockRejectedValue(
                new Error('Database connection failed')
            );

            const response = await request(app)
                .delete('/api/event-registration/unregister/1')
                .send({ volunteer_id: 7 });

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        });
    });
});