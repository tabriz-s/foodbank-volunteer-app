const {
    getAllEvents,
    getEventById,
    getEventsByStatus,
    createEvent,
    updateEvent,
    deleteEvent
} = require('../../src/controllers/EventController');
const EventModel = require('../../src/models/EventModel');
const AdminModel = require('../../src/models/AdminModel');

jest.mock('../../src/models/EventModel');
jest.mock('../../src/models/AdminModel');

describe('Events Controller', () => {
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

    describe('getAllEvents', () => {
        test('should return all events successfully', async () => {
            const mockEvents = [
                { id: 1, name: 'Event 1' },
                { id: 2, name: 'Event 2' }
            ];
            EventModel.getAllEvents.mockReturnValue(mockEvents);

            await getAllEvents(req, res);

            expect(EventModel.getAllEvents).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                count: 2,
                data: mockEvents
            });
        });

        test('should handle error when getting all events', async () => {
            EventModel.getAllEvents.mockImplementation(() => {
                throw new Error('Database error');
            });

            await getAllEvents(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Server error',
                error: 'Database error'
            });
        });
    });

    describe('getEventById', () => {
        test('should return event by id successfully', async () => {
            req.params.id = '1';
            const mockEvent = { id: 1, name: 'Test Event' };
            EventModel.getEventById.mockReturnValue(mockEvent);

            await getEventById(req, res);

            expect(EventModel.getEventById).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockEvent
            });
        });

        test('should return 404 when event not found', async () => {
            req.params.id = '999';
            EventModel.getEventById.mockReturnValue(null);

            await getEventById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Event not found'
            });
        });

        test('should handle error when getting event by id', async () => {
            req.params.id = '1';
            EventModel.getEventById.mockImplementation(() => {
                throw new Error('Database error');
            });

            await getEventById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Server error',
                error: 'Database error'
            });
        });
    });

    describe('getEventsByStatus', () => {
        test('should return events by status successfully', async () => {
            req.query.status = 'active';
            const mockEvents = [{ id: 1, status: 'active' }];
            EventModel.getEventsByStatus.mockReturnValue(mockEvents);

            await getEventsByStatus(req, res);

            expect(EventModel.getEventsByStatus).toHaveBeenCalledWith('active');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                count: 1,
                data: mockEvents
            });
        });

        test('should return 400 when status parameter is missing', async () => {
            await getEventsByStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Status parameter is required'
            });
        });

        test('should handle error when getting events by status', async () => {
            req.query.status = 'active';
            EventModel.getEventsByStatus.mockImplementation(() => {
                throw new Error('Database error');
            });

            await getEventsByStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Server error',
                error: 'Database error'
            });
        });
    });

    describe('createEvent', () => {
        test('should create event successfully', async () => {
            req.body = {
                name: 'New Event',
                description: 'Test Description',
                location: 'Test Location',
                urgency: 'High',
                date: '2025-12-01',
                requiredSkills: [1, 2]
            };

            const mockEvent = { id: 1, name: 'New Event' };
            EventModel.createEvent.mockReturnValue(mockEvent);
            AdminModel.addActivity.mockReturnValue(true);

            await createEvent(req, res);

            expect(EventModel.createEvent).toHaveBeenCalled();
            expect(AdminModel.addActivity).toHaveBeenCalledWith('Event created', 'New Event');
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Event created successfully',
                data: mockEvent
            });
        });

        test('should create event with default status', async () => {
            req.body = {
                name: 'New Event',
                description: 'Test Description',
                location: 'Test Location',
                urgency: 'High',
                date: '2025-12-01'
            };

            const mockEvent = { id: 1, name: 'New Event', status: 'upcoming' };
            EventModel.createEvent.mockReturnValue(mockEvent);

            await createEvent(req, res);

            expect(EventModel.createEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'upcoming',
                    requiredSkills: []
                })
            );
            expect(res.status).toHaveBeenCalledWith(201);
        });

        test('should handle error when creating event', async () => {
            req.body = {
                name: 'New Event',
                description: 'Test Description',
                location: 'Test Location',
                urgency: 'High',
                date: '2025-12-01'
            };

            EventModel.createEvent.mockImplementation(() => {
                throw new Error('Database error');
            });

            await createEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Server error',
                error: 'Database error'
            });
        });
    });

    describe('updateEvent', () => {
        test('should update event successfully', async () => {
            req.params.id = '1';
            req.body = {
                name: 'Updated Event',
                urgency: 'Critical'
            };

            const existingEvent = { id: 1, name: 'Old Event' };
            const updatedEvent = { id: 1, name: 'Updated Event', urgency: 'Critical' };

            EventModel.getEventById.mockReturnValue(existingEvent);
            EventModel.updateEvent.mockReturnValue(updatedEvent);
            AdminModel.addActivity.mockReturnValue(true);

            await updateEvent(req, res);

            expect(EventModel.getEventById).toHaveBeenCalledWith('1');
            expect(EventModel.updateEvent).toHaveBeenCalledWith('1', {
                name: 'Updated Event',
                urgency: 'Critical'
            });
            expect(AdminModel.addActivity).toHaveBeenCalledWith('Event updated', 'Updated Event');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Event updated successfully',
                data: updatedEvent
            });
        });

        test('should return 404 when event not found', async () => {
            req.params.id = '999';
            req.body = { name: 'Updated Event' };

            EventModel.getEventById.mockReturnValue(null);

            await updateEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Event not found'
            });
        });

        test('should update only provided fields', async () => {
            req.params.id = '1';
            req.body = { name: 'Updated Name' };

            const existingEvent = { id: 1, name: 'Old Event' };
            const updatedEvent = { id: 1, name: 'Updated Name' };

            EventModel.getEventById.mockReturnValue(existingEvent);
            EventModel.updateEvent.mockReturnValue(updatedEvent);

            await updateEvent(req, res);

            expect(EventModel.updateEvent).toHaveBeenCalledWith('1', {
                name: 'Updated Name'
            });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should handle error when updating event', async () => {
            req.params.id = '1';
            req.body = { name: 'Updated Event' };

            EventModel.getEventById.mockReturnValue({ id: 1, name: 'Old Event' });
            EventModel.updateEvent.mockImplementation(() => {
                throw new Error('Database error');
            });

            await updateEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Server error',
                error: 'Database error'
            });
        });
    });

    describe('deleteEvent', () => {
        test('should delete event successfully', async () => {
            req.params.id = '1';
            const mockEvent = { id: 1, name: 'Test Event' };

            EventModel.getEventById.mockReturnValue(mockEvent);
            EventModel.deleteEvent.mockReturnValue(true);
            AdminModel.addActivity.mockReturnValue(true);

            await deleteEvent(req, res);

            expect(EventModel.getEventById).toHaveBeenCalledWith('1');
            expect(EventModel.deleteEvent).toHaveBeenCalledWith('1');
            expect(AdminModel.addActivity).toHaveBeenCalledWith('Event deleted', 'Test Event');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Event deleted successfully'
            });
        });

        test('should return 404 when event not found', async () => {
            req.params.id = '999';

            EventModel.getEventById.mockReturnValue(null);

            await deleteEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Event not found'
            });
        });

        test('should return 500 when delete fails', async () => {
            req.params.id = '1';
            const mockEvent = { id: 1, name: 'Test Event' };

            EventModel.getEventById.mockReturnValue(mockEvent);
            EventModel.deleteEvent.mockReturnValue(false);

            await deleteEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to delete event'
            });
        });

        test('should handle error when deleting event', async () => {
            req.params.id = '1';

            EventModel.getEventById.mockImplementation(() => {
                throw new Error('Database error');
            });

            await deleteEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Server error',
                error: 'Database error'
            });
        });
    });
});