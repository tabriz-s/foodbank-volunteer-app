const EventModel = require('../../src/models/EventModel');

describe('EventModel', () => {

    describe('getAllEvents', () => {
        test('should return an array of events', () => {
            const events = EventModel.getAllEvents();
            
            expect(Array.isArray(events)).toBe(true);
            expect(events.length).toBeGreaterThan(0);
        });

        test('events should have required properties', () => {
            const events = EventModel.getAllEvents();
            const event = events[0];

            expect(event).toHaveProperty('Event_id');
            expect(event).toHaveProperty('name');
            expect(event).toHaveProperty('description');
            expect(event).toHaveProperty('location');
            expect(event).toHaveProperty('date');
        });
    });

    describe('getEventById', () => {
        test('should return event for valid ID', () => {
            const event = EventModel.getEventById(1);
            
            expect(event).toBeDefined();
            expect(event.Event_id).toBe(1);
        });

        test('should return undefined for non-existent ID', () => {
            const event = EventModel.getEventById(999);
            
            expect(event).toBeUndefined();
        });
    });

    describe('createEvent', () => {
        test('should create a new event', () => {
            const eventData = {
                name: 'Test Event',
                description: 'Test Description',
                location: 'Test Location',
                urgency: 'Medium',
                date: '2025-12-01',
                requiredSkills: [1]
            };

            const newEvent = EventModel.createEvent(eventData);

            expect(newEvent).toHaveProperty('Event_id');
            expect(newEvent.name).toBe('Test Event');
            expect(newEvent.status).toBe('upcoming');
        });
    });

    describe('updateEvent', () => {
        test('should update existing event', () => {
            const updates = { name: 'Updated Name' };
            const updatedEvent = EventModel.updateEvent(1, updates);

            expect(updatedEvent).toBeDefined();
            expect(updatedEvent.name).toBe('Updated Name');
        });

        test('should return null for non-existent event', () => {
            const result = EventModel.updateEvent(999, { name: 'Test' });
            
            expect(result).toBeNull();
        });
    });

    describe('deleteEvent', () => {
        test('should delete existing event', () => {
            const newEvent = EventModel.createEvent({
                name: 'Delete Test',
                description: 'Will be deleted',
                location: 'Test',
                urgency: 'Low',
                date: '2025-12-25',
                requiredSkills: [1]
            });

            const result = EventModel.deleteEvent(newEvent.Event_id);
            expect(result).toBe(true);
        });

        test('should return false for non-existent event', () => {
            const result = EventModel.deleteEvent(999);
            
            expect(result).toBe(false);
        });
    });
});