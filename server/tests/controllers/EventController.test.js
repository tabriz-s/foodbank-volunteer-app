const EventController = require('../../src/controllers/EventController');
const EventModel = require('../../src/models/EventModel');

describe('EventController', () => {

    describe('getAllEvents', () => {
        test('should return all events with success response', () => {
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            EventController.getAllEvents(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.any(Array)
                })
            );
        });
    });
    
    describe('getEventById', () => {
        test('should return event for existing ID', () => {
            const req = { params: { id: '1' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            EventController.getEventById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.any(Object)
                })
            );
        });

        test('should return 404 for non-existent event', () => {
            const req = { params: { id: '999' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            EventController.getEventById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
    describe('createEvent', () => {
        test('should create event successfully', () => {
            const req = {
                body: {
                    name: 'Test Event',
                    description: 'Test Description',
                    location: 'Test Location',
                    date: '2025-12-01',
                    requiredSkills: [1],
                    urgency: 'Medium'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            EventController.createEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.any(Object)
                })
            );
        });
    });
    describe('updateEvent', () => {
        test('should update existing event', () => {
            const req = {
                params: { id: '1' },
                body: { name: 'Updated Name' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            EventController.updateEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('deleteEvent', () => {
        test('should delete existing event', () => {
            const req = { params: { id: '1' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            EventController.deleteEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});