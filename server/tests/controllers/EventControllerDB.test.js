const {
    getAllEventsDB,
    getEventByIdDB,
    getEventsByStatusDB,
    getEventsByUrgencyDB,
    getUpcomingEventsDB,
    createEventDB,
    updateEventDB,
    deleteEventDB
} = require('../../src/controllers/EventControllerDB');
const EventDB = require('../../src/models/EventModelDB');

jest.mock('../../src/models/EventModelDB');

describe('Events Controller DB', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            query: {},
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getAllEventsDB', () => {
        test('should return all events successfully', async () => {
            const mockEvents = [
                { Event_id: 1, Event_name: 'Test Event 1' },
                { Event_id: 2, Event_name: 'Test Event 2' }
            ];
            EventDB.getAllEventsWithSkills.mockResolvedValue(mockEvents);

            await getAllEventsDB(req, res);

            expect(EventDB.getAllEventsWithSkills).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                source: 'Azure MySQL Database',
                count: 2,
                data: mockEvents
            });
        });

        test('should handle error when getting all events', async () => {
            EventDB.getAllEventsWithSkills.mockRejectedValue(new Error('Database error'));

            await getAllEventsDB(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to retrieve events from database',
                error: 'Database error'
            });
        });
    });

    describe('getEventByIdDB', () => {
        test('should return event by id successfully', async () => {
            req.params.id = '1';
            const mockEvent = { Event_id: 1, Event_name: 'Test Event' };
            EventDB.getEventById.mockResolvedValue(mockEvent);

            await getEventByIdDB(req, res);

            expect(EventDB.getEventById).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                source: 'Azure MySQL Database',
                data: mockEvent
            });
        });

        test('should return 404 when event not found', async () => {
            req.params.id = '999';
            EventDB.getEventById.mockResolvedValue(null);

            await getEventByIdDB(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Event not found in database'
            });
        });

        test('should handle error when getting event by id', async () => {
            req.params.id = '1';
            EventDB.getEventById.mockRejectedValue(new Error('Database error'));

            await getEventByIdDB(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to retrieve event from database',
                error: 'Database error'
            });
        });
    });

    describe('getEventsByStatusDB', () => {
        test('should return events by status successfully', async () => {
            req.query.status = 'active';
            const mockEvents = [{ Event_id: 1, Status: 'active' }];
            EventDB.getEventsByStatus.mockResolvedValue(mockEvents);

            await getEventsByStatusDB(req, res);

            expect(EventDB.getEventsByStatus).toHaveBeenCalledWith('active');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                source: 'Azure MySQL Database',
                count: 1,
                data: mockEvents
            });
        });

        test('should return 400 when status parameter is missing', async () => {
            await getEventsByStatusDB(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Status parameter is required'
            });
        });

        test('should handle error when getting events by status', async () => {
            req.query.status = 'active';
            EventDB.getEventsByStatus.mockRejectedValue(new Error('Database error'));

            await getEventsByStatusDB(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to retrieve events by status from database',
                error: 'Database error'
            });
        });
    });

    describe('getEventsByUrgencyDB', () => {
        test('should return events by urgency successfully', async () => {
            req.query.urgency = 'High';
            const mockEvents = [{ Event_id: 1, Urgency: 'High' }];
            EventDB.getEventsByUrgency.mockResolvedValue(mockEvents);

            await getEventsByUrgencyDB(req, res);

            expect(EventDB.getEventsByUrgency).toHaveBeenCalledWith('High');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                source: 'Azure MySQL Database',
                count: 1,
                data: mockEvents
            });
        });

        test('should return 400 when urgency parameter is missing', async () => {
            await getEventsByUrgencyDB(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Urgency parameter is required'
            });
        });

        test('should handle error when getting events by urgency', async () => {
            req.query.urgency = 'High';
            EventDB.getEventsByUrgency.mockRejectedValue(new Error('Database error'));

            await getEventsByUrgencyDB(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to retrieve events by urgency from database',
                error: 'Database error'
            });
        });
    });

    describe('getUpcomingEventsDB', () => {
        test('should return upcoming events successfully', async () => {
            const mockEvents = [
                { Event_id: 1, Event_name: 'Upcoming Event 1' },
                { Event_id: 2, Event_name: 'Upcoming Event 2' }
            ];
            EventDB.getUpcomingEvents.mockResolvedValue(mockEvents);

            await getUpcomingEventsDB(req, res);

            expect(EventDB.getUpcomingEvents).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                source: 'Azure MySQL Database',
                count: 2,
                data: mockEvents
            });
        });

        test('should handle error when getting upcoming events', async () => {
            EventDB.getUpcomingEvents.mockRejectedValue(new Error('Database error'));

            await getUpcomingEventsDB(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to retrieve upcoming events from database',
                error: 'Database error'
            });
        });
    });

    describe('createEventDB', () => {
        test('should create event successfully with skills', async () => {
            req.body = {
                name: 'New Event',
                description: 'Event Description',
                location: 'Test Location',
                date: '2025-12-01',
                urgency: 'High',
                requiredSkills: [1, 2]
            };

            const mockEvent = { Event_id: 1 };
            const mockEventWithSkills = { Event_id: 1, Event_name: 'New Event', skills: [1, 2] };

            EventDB.createEvent.mockResolvedValue(mockEvent);
            EventDB.addSkillsToEvent.mockResolvedValue(true);
            EventDB.getEventWithSkills.mockResolvedValue(mockEventWithSkills);

            await createEventDB(req, res);

            expect(EventDB.createEvent).toHaveBeenCalled();
            expect(EventDB.addSkillsToEvent).toHaveBeenCalledWith(1, expect.any(Array));
            expect(EventDB.getEventWithSkills).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                source: 'Azure MySQL Database',
                message: 'Event created successfully',
                data: mockEventWithSkills
            });
        });

        test('should create event with skills in object format', async () => {
            req.body = {
                name: 'New Event',
                description: 'Event Description',
                location: 'Test Location',
                date: '2025-12-01',
                urgency: 'High',
                requiredSkills: [
                    { skillId: 1, isRequired: true, neededCount: 5 },
                    { skillId: 2, isRequired: false, neededCount: 3 }
                ]
            };

            const mockEvent = { Event_id: 1 };
            const mockEventWithSkills = { Event_id: 1, Event_name: 'New Event' };

            EventDB.createEvent.mockResolvedValue(mockEvent);
            EventDB.addSkillsToEvent.mockResolvedValue(true);
            EventDB.getEventWithSkills.mockResolvedValue(mockEventWithSkills);

            await createEventDB(req, res);

            expect(EventDB.addSkillsToEvent).toHaveBeenCalledWith(1, [
                { skillId: 1, isRequired: true, neededCount: 5 },
                { skillId: 2, isRequired: false, neededCount: 3 }
            ]);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        test('should create event without skills', async () => {
            req.body = {
                name: 'New Event',
                description: 'Event Description',
                location: 'Test Location',
                date: '2025-12-01',
                urgency: 'High'
            };

            const mockEvent = { Event_id: 1 };
            const mockEventWithSkills = { Event_id: 1, Event_name: 'New Event' };

            EventDB.createEvent.mockResolvedValue(mockEvent);
            EventDB.getEventWithSkills.mockResolvedValue(mockEventWithSkills);

            await createEventDB(req, res);

            expect(EventDB.createEvent).toHaveBeenCalled();
            expect(EventDB.addSkillsToEvent).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });

        test('should handle error when creating event', async () => {
            req.body = {
                name: 'New Event',
                description: 'Event Description',
                location: 'Test Location',
                date: '2025-12-01',
                urgency: 'High'
            };

            EventDB.createEvent.mockRejectedValue(new Error('Database error'));

            await createEventDB(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to create event in database',
                error: 'Database error'
            });
        });
    });

    describe('updateEventDB', () => {
        test('should update event successfully', async () => {
            req.params.id = '1';
            req.body = {
                name: 'Updated Event',
                urgency: 'Critical'
            };

            const mockEventWithSkills = { Event_id: 1, Event_name: 'Updated Event' };

            EventDB.eventExists.mockResolvedValue(true);
            EventDB.updateEvent.mockResolvedValue(true);
            EventDB.getEventWithSkills.mockResolvedValue(mockEventWithSkills);

            await updateEventDB(req, res);

            expect(EventDB.eventExists).toHaveBeenCalledWith('1');
            expect(EventDB.updateEvent).toHaveBeenCalledWith('1', expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                source: 'Azure MySQL Database',
                message: 'Event updated successfully',
                data: mockEventWithSkills
            });
        });

        test('should update event with skills', async () => {
            req.params.id = '1';
            req.body = {
                name: 'Updated Event',
                requiredSkills: [1, 2, 3]
            };

            const mockEventWithSkills = { Event_id: 1, Event_name: 'Updated Event' };

            EventDB.eventExists.mockResolvedValue(true);
            EventDB.updateEvent.mockResolvedValue(true);
            EventDB.updateEventSkills.mockResolvedValue(true);
            EventDB.getEventWithSkills.mockResolvedValue(mockEventWithSkills);

            await updateEventDB(req, res);

            expect(EventDB.updateEventSkills).toHaveBeenCalledWith('1', expect.any(Array));
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should return 404 when event not found', async () => {
            req.params.id = '999';
            req.body = { name: 'Updated Event' };

            EventDB.eventExists.mockResolvedValue(false);

            await updateEventDB(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Event not found in database'
            });
        });

        test('should handle error when updating event', async () => {
            req.params.id = '1';
            req.body = { name: 'Updated Event' };

            EventDB.eventExists.mockResolvedValue(true);
            EventDB.updateEvent.mockRejectedValue(new Error('Database error'));

            await updateEventDB(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to update event in database',
                error: 'Database error'
            });
        });
    });

    describe('deleteEventDB', () => {
        test('should delete event successfully', async () => {
            req.params.id = '1';
            const mockEvent = { Event_id: 1, Event_name: 'Test Event' };
            const mockResult = { affectedRows: 1 };

            EventDB.getEventById.mockResolvedValue(mockEvent);
            EventDB.deleteEvent.mockResolvedValue(mockResult);

            await deleteEventDB(req, res);

            expect(EventDB.getEventById).toHaveBeenCalledWith('1');
            expect(EventDB.deleteEvent).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                source: 'Azure MySQL Database',
                message: 'Event deleted successfully',
                data: mockResult
            });
        });

        test('should return 404 when event not found', async () => {
            req.params.id = '999';

            EventDB.getEventById.mockResolvedValue(null);

            await deleteEventDB(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Event not found in database'
            });
        });

        test('should handle error when deleting event', async () => {
            req.params.id = '1';

            EventDB.getEventById.mockRejectedValue(new Error('Database error'));

            await deleteEventDB(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to delete event from database',
                error: 'Database error'
            });
        });
    });
});