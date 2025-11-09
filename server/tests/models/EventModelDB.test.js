const EventModelDB = require('../../src/models/EventModelDB');
const { getConnection } = require('../../src/config/database');

jest.mock('../../src/config/database');

describe('Event Model DB', () => {
    let mockConnection;

    beforeEach(() => {
        mockConnection = {
            query: jest.fn()
        };
        getConnection.mockResolvedValue(mockConnection);
        jest.clearAllMocks();
    });

    describe('getAllEvents', () => {
        test('should return all events', async () => {
            const mockEvents = [
                { Event_id: 1, Event_name: 'Event 1' },
                { Event_id: 2, Event_name: 'Event 2' }
            ];
            mockConnection.query.mockResolvedValue([mockEvents]);

            const result = await EventModelDB.getAllEvents();

            expect(result).toEqual(mockEvents);
            expect(mockConnection.query).toHaveBeenCalledWith('SELECT * FROM events ORDER BY Date DESC');
        });

        test('should throw error when database fails', async () => {
            mockConnection.query.mockRejectedValue(new Error('Database error'));

            await expect(EventModelDB.getAllEvents()).rejects.toThrow('Database error');
        });
    });

    describe('getEventById', () => {
        test('should return event by id', async () => {
            const mockEvent = { Event_id: 1, Event_name: 'Test Event' };
            mockConnection.query.mockResolvedValue([[mockEvent]]);

            const result = await EventModelDB.getEventById(1);

            expect(result).toEqual(mockEvent);
            expect(mockConnection.query).toHaveBeenCalledWith(
                'SELECT * FROM events WHERE Event_id = ?',
                [1]
            );
        });

        test('should throw error when database fails', async () => {
            mockConnection.query.mockRejectedValue(new Error('Database error'));

            await expect(EventModelDB.getEventById(1)).rejects.toThrow('Database error');
        });
    });

    describe('getEventWithSkills', () => {
        test('should return event with skills', async () => {
            const mockEvent = { Event_id: 1, Event_name: 'Test Event' };
            const mockSkills = [
                { Skills_id: 1, Description: 'Skill 1', Is_required: true, Needed_count: 5 },
                { Skills_id: 2, Description: 'Skill 2', Is_required: false, Needed_count: 3 }
            ];

            mockConnection.query
                .mockResolvedValueOnce([[mockEvent]])
                .mockResolvedValueOnce([mockSkills]);

            const result = await EventModelDB.getEventWithSkills(1);

            expect(result.Event_id).toBe(1);
            expect(result.skills).toHaveLength(2);
            expect(result.skills[0].skillId).toBe(1);
            expect(result.skills[0].isRequired).toBe(true);
        });

        test('should return null when event not found', async () => {
            mockConnection.query.mockResolvedValue([[]]);

            const result = await EventModelDB.getEventWithSkills(999);

            expect(result).toBeNull();
        });

        test('should throw error when database fails', async () => {
            mockConnection.query.mockRejectedValue(new Error('Database error'));

            await expect(EventModelDB.getEventWithSkills(1)).rejects.toThrow('Database error');
        });
    });

    describe('getAllEventsWithSkills', () => {
        test('should return all events with their skills', async () => {
            const mockEvents = [
                { Event_id: 1, Event_name: 'Event 1' },
                { Event_id: 2, Event_name: 'Event 2' }
            ];
            const mockSkills1 = [{ Skills_id: 1, Description: 'Skill 1', Is_required: true, Needed_count: 5 }];
            const mockSkills2 = [{ Skills_id: 2, Description: 'Skill 2', Is_required: false, Needed_count: 3 }];

            mockConnection.query
                .mockResolvedValueOnce([mockEvents])
                .mockResolvedValueOnce([mockSkills1])
                .mockResolvedValueOnce([mockSkills2]);

            const result = await EventModelDB.getAllEventsWithSkills();

            expect(result).toHaveLength(2);
            expect(result[0].skills).toBeDefined();
            expect(result[1].skills).toBeDefined();
        });

        test('should throw error when database fails', async () => {
            mockConnection.query.mockRejectedValue(new Error('Database error'));

            await expect(EventModelDB.getAllEventsWithSkills()).rejects.toThrow('Database error');
        });
    });

    describe('getEventsByStatus', () => {
        test('should return events by status', async () => {
            const mockEvents = [{ Event_id: 1, Status: 'active' }];
            mockConnection.query.mockResolvedValue([mockEvents]);

            const result = await EventModelDB.getEventsByStatus('active');

            expect(result).toEqual(mockEvents);
            expect(mockConnection.query).toHaveBeenCalledWith(
                'SELECT * FROM events WHERE Status = ? ORDER BY Date DESC',
                ['active']
            );
        });

        test('should throw error when database fails', async () => {
            mockConnection.query.mockRejectedValue(new Error('Database error'));

            await expect(EventModelDB.getEventsByStatus('active')).rejects.toThrow('Database error');
        });
    });

    describe('getEventsByUrgency', () => {
        test('should return events by urgency', async () => {
            const mockEvents = [{ Event_id: 1, Urgency: 'High' }];
            mockConnection.query.mockResolvedValue([mockEvents]);

            const result = await EventModelDB.getEventsByUrgency('High');

            expect(result).toEqual(mockEvents);
            expect(mockConnection.query).toHaveBeenCalledWith(
                'SELECT * FROM events WHERE Urgency = ? ORDER BY Date DESC',
                ['High']
            );
        });

        test('should throw error when database fails', async () => {
            mockConnection.query.mockRejectedValue(new Error('Database error'));

            await expect(EventModelDB.getEventsByUrgency('High')).rejects.toThrow('Database error');
        });
    });

    describe('getUpcomingEvents', () => {
        test('should return upcoming events', async () => {
            const mockEvents = [
                { Event_id: 1, Date: '2025-12-01', Status: 'planned' },
                { Event_id: 2, Date: '2025-12-15', Status: 'active' }
            ];
            mockConnection.query.mockResolvedValue([mockEvents]);

            const result = await EventModelDB.getUpcomingEvents();

            expect(result).toEqual(mockEvents);
        });

        test('should throw error when database fails', async () => {
            mockConnection.query.mockRejectedValue(new Error('Database error'));

            await expect(EventModelDB.getUpcomingEvents()).rejects.toThrow('Database error');
        });
    });

    describe('eventExists', () => {
        test('should return true when event exists', async () => {
            const mockEvent = { Event_id: 1, Event_name: 'Test Event' };
            mockConnection.query.mockResolvedValue([[mockEvent]]);

            const result = await EventModelDB.eventExists(1);

            expect(result).toBe(true);
        });

        test('should return false when event does not exist', async () => {
            mockConnection.query.mockResolvedValue([[]]);

            const result = await EventModelDB.eventExists(999);

            expect(result).toBe(false);
        });

        test('should return false when database fails', async () => {
            mockConnection.query.mockRejectedValue(new Error('Database error'));

            const result = await EventModelDB.eventExists(1);

            expect(result).toBe(false);
        });
    });

    describe('countEventsByStatus', () => {
        test('should return count of events by status', async () => {
            mockConnection.query.mockResolvedValue([[{ count: 5 }]]);

            const result = await EventModelDB.countEventsByStatus('active');

            expect(result).toBe(5);
            expect(mockConnection.query).toHaveBeenCalledWith(
                'SELECT COUNT(*) as count FROM events WHERE Status = ?',
                ['active']
            );
        });

        test('should throw error when database fails', async () => {
            mockConnection.query.mockRejectedValue(new Error('Database error'));

            await expect(EventModelDB.countEventsByStatus('active')).rejects.toThrow('Database error');
        });
    });

    describe('countTotalEvents', () => {
        test('should return total count of events', async () => {
            mockConnection.query.mockResolvedValue([[{ count: 10 }]]);

            const result = await EventModelDB.countTotalEvents();

            expect(result).toBe(10);
            expect(mockConnection.query).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM events');
        });

        test('should throw error when database fails', async () => {
            mockConnection.query.mockRejectedValue(new Error('Database error'));

            await expect(EventModelDB.countTotalEvents()).rejects.toThrow('Database error');
        });
    });

    describe('addSkillsToEvent', () => {
        test('should add skills to event', async () => {
            const skills = [
                { skillId: 1, isRequired: true, neededCount: 5 },
                { skillId: 2, isRequired: false, neededCount: 3 }
            ];
            mockConnection.query.mockResolvedValue([{ insertId: 1 }]);

            const result = await EventModelDB.addSkillsToEvent(1, skills);

            expect(result).toBe(true);
            expect(mockConnection.query).toHaveBeenCalledTimes(2);
        });

        test('should throw error when database fails', async () => {
            const skills = [{ skillId: 1, isRequired: true, neededCount: 5 }];
            mockConnection.query.mockRejectedValue(new Error('Database error'));

            await expect(EventModelDB.addSkillsToEvent(1, skills)).rejects.toThrow('Database error');
        });
    });

    describe('updateEventSkills', () => {
        test('should update event skills', async () => {
            const skills = [{ skillId: 1, isRequired: true, neededCount: 5 }];
            mockConnection.query.mockResolvedValue([{ affectedRows: 1 }]);

            const result = await EventModelDB.updateEventSkills(1, skills);

            expect(result).toBe(true);
            expect(mockConnection.query).toHaveBeenCalledWith(
                'DELETE FROM event_skills WHERE Event_id = ?',
                [1]
            );
        });

        test('should update event skills with empty array', async () => {
            mockConnection.query.mockResolvedValue([{ affectedRows: 1 }]);

            const result = await EventModelDB.updateEventSkills(1, []);

            expect(result).toBe(true);
        });

        test('should throw error when database fails', async () => {
            mockConnection.query.mockRejectedValue(new Error('Database error'));

            await expect(EventModelDB.updateEventSkills(1, [])).rejects.toThrow('Database error');
        });
    });

    describe('createEvent', () => {
        test('should create new event', async () => {
            const eventData = {
                Event_name: 'New Event',
                Description: 'Test Description',
                Location: 'Test Location',
                Date: '2025-12-01',
                Urgency: 'High'
            };
            const mockEvent = { Event_id: 1, ...eventData };

            mockConnection.query
                .mockResolvedValueOnce([{ insertId: 1 }])
                .mockResolvedValueOnce([[mockEvent]]);

            const result = await EventModelDB.createEvent(eventData);

            expect(result.Event_id).toBe(1);
            expect(result.Event_name).toBe('New Event');
        });

        test('should throw error when database fails', async () => {
            const eventData = { Event_name: 'New Event' };
            mockConnection.query.mockRejectedValue(new Error('Database error'));

            await expect(EventModelDB.createEvent(eventData)).rejects.toThrow('Database error');
        });
    });

    describe('updateEvent', () => {
        test('should update event', async () => {
            const updates = { Event_name: 'Updated Event', Urgency: 'Critical' };
            const updatedEvent = { Event_id: 1, ...updates };

            mockConnection.query
                .mockResolvedValueOnce([{ affectedRows: 1 }])
                .mockResolvedValueOnce([[updatedEvent]]);

            const result = await EventModelDB.updateEvent(1, updates);

            expect(result.Event_name).toBe('Updated Event');
        });

        test('should throw error when no fields to update', async () => {
            await expect(EventModelDB.updateEvent(1, {})).rejects.toThrow('No valid fields to update');
        });

        test('should throw error when event not found', async () => {
            const updates = { Event_name: 'Updated Event' };
            mockConnection.query.mockResolvedValue([{ affectedRows: 0 }]);

            await expect(EventModelDB.updateEvent(999, updates)).rejects.toThrow('Event not found');
        });

        test('should throw error when database fails', async () => {
            const updates = { Event_name: 'Updated Event' };
            mockConnection.query.mockRejectedValue(new Error('Database error'));

            await expect(EventModelDB.updateEvent(1, updates)).rejects.toThrow('Database error');
        });
    });

    describe('deleteEvent', () => {
        test('should delete event', async () => {
            mockConnection.query.mockResolvedValue([{ affectedRows: 1 }]);

            const result = await EventModelDB.deleteEvent(1);

            expect(result.message).toBe('Event deleted successfully');
            expect(result.affectedRows).toBe(1);
        });

        test('should throw error when event not found', async () => {
            mockConnection.query.mockResolvedValue([{ affectedRows: 0 }]);

            await expect(EventModelDB.deleteEvent(999)).rejects.toThrow('Event not found');
        });

        test('should throw error when database fails', async () => {
            mockConnection.query.mockRejectedValue(new Error('Database error'));

            await expect(EventModelDB.deleteEvent(1)).rejects.toThrow('Database error');
        });
    });
});