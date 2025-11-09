const EventSignupModelDB = require('../../src/models/EventSignupModelDB');
const { getConnection } = require('../../src/config/database');

// Mock the database connection
jest.mock('../../src/config/database');

describe('EventSignupModelDB', () => {
    let mockConnection;
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        mockConnection = {
            query: jest.fn()
        };
        
        getConnection.mockResolvedValue(mockConnection);
    });

    // ============================================
    // EVENT QUERIES
    // ============================================
    //
    describe('getUpcomingEvents', () => {
        test('should return all future events', async () => {
            const mockEvents = [
                { Event_id: 1, Event_name: 'Food Drive', Date: '2025-12-01', Status: 'planned' },
                { Event_id: 2, Event_name: 'Warehouse Help', Date: '2025-12-05', Status: 'active' }
            ];
            
            mockConnection.query.mockResolvedValue([mockEvents]);
            
            const result = await EventSignupModelDB.getUpcomingEvents();
            
            expect(result).toEqual(mockEvents);
            expect(mockConnection.query).toHaveBeenCalledTimes(1);
            expect(mockConnection.query.mock.calls[0][0]).toContain('WHERE Date >= CURDATE()');
        });

        test('should only return planned or active events', async () => {
            mockConnection.query.mockResolvedValue([[]]);
            
            await EventSignupModelDB.getUpcomingEvents();
            
            expect(mockConnection.query).toHaveBeenCalledTimes(1);
            expect(mockConnection.query.mock.calls[0][0]).toContain("Status IN ('planned', 'active')");
        });

        test('should throw error if query fails', async () => {
            mockConnection.query.mockRejectedValue(new Error('Database error'));
            
            await expect(EventSignupModelDB.getUpcomingEvents())
                .rejects.toThrow('Database error');
        });
    });
    //

    describe('getEventById', () => {
        test('should return event by ID', async () => {
            const mockEvent = { Event_id: 1, Event_name: 'Food Drive', Date: '2025-12-01' };
            
            mockConnection.query.mockResolvedValue([[mockEvent]]);
            
            const result = await EventSignupModelDB.getEventById(1);
            
            expect(result).toEqual(mockEvent);
            expect(mockConnection.query).toHaveBeenCalledWith(
                'SELECT * FROM events WHERE Event_id = ?',
                [1]
            );
        });

        test('should return undefined if event not found', async () => {
            mockConnection.query.mockResolvedValue([[]]);
            
            const result = await EventSignupModelDB.getEventById(999);
            
            expect(result).toBeUndefined();
        });
    });

    describe('getEventWithSkills', () => {
        test('should return event with required skills', async () => {
            const mockEvent = { Event_id: 1, Event_name: 'Food Drive' };
            const mockSkills = [
                { Skills_id: 1, Skill_name: 'Cooking', Is_required: true, Needed_count: 10, Current_signups: 5 }
            ];
            
            mockConnection.query
                .mockResolvedValueOnce([[mockEvent]])  // getEventById
                .mockResolvedValueOnce([mockSkills]);   // skills query
            
            const result = await EventSignupModelDB.getEventWithSkills(1);
            
            expect(result).toEqual({
                ...mockEvent,
                required_skills: mockSkills
            });
        });

        test('should return null if event not found', async () => {
            mockConnection.query.mockResolvedValueOnce([[]]);
            
            const result = await EventSignupModelDB.getEventWithSkills(999);
            
            expect(result).toBeNull();
        });
    });

    // ============================================
    // SIGNUP QUERIES
    // ============================================

    describe('getVolunteerSignups', () => {
        test('should return all signups for volunteer', async () => {
            const mockSignups = [
                { 
                    Signup_id: 1, 
                    Event_id: 1, 
                    Event_name: 'Food Drive',
                    Registered_as_skill: 'Cooking'
                }
            ];
            
            mockConnection.query.mockResolvedValue([mockSignups]);
            
            const result = await EventSignupModelDB.getVolunteerSignups(7);
            
            expect(result).toEqual(mockSignups);
            expect(mockConnection.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE es.Volunteer_id = ?'),
                [7]
            );
        });

        test('should return empty array if no signups', async () => {
            mockConnection.query.mockResolvedValue([[]]);
            
            const result = await EventSignupModelDB.getVolunteerSignups(7);
            
            expect(result).toEqual([]);
        });
    });

    describe('checkIfRegistered', () => {
        test('should return true if already registered', async () => {
            mockConnection.query.mockResolvedValue([[{ Signup_id: 1 }]]);
            
            const result = await EventSignupModelDB.checkIfRegistered(7, 1);
            
            expect(result).toBe(true);
        });

        test('should return false if not registered', async () => {
            mockConnection.query.mockResolvedValue([[]]);
            
            const result = await EventSignupModelDB.checkIfRegistered(7, 1);
            
            expect(result).toBe(false);
        });
    });

    describe('getEventSignupCount', () => {
        test('should return count of registered volunteers', async () => {
            mockConnection.query.mockResolvedValue([[{ count: 15 }]]);
            
            const result = await EventSignupModelDB.getEventSignupCount(1);
            
            expect(result).toBe(15);
        });

        test('should return 0 if no signups', async () => {
            mockConnection.query.mockResolvedValue([[{ count: 0 }]]);
            
            const result = await EventSignupModelDB.getEventSignupCount(1);
            
            expect(result).toBe(0);
        });
    });

    // ============================================
    // VALIDATION FUNCTIONS
    // ============================================

    describe('hasRequiredSkills', () => {
        test('should return true if volunteer has required skills', async () => {
            const mockSkills = [{ Skills_id: 1, Is_required: true }];
            const mockVolunteerSkills = [{ Skills_id: 1 }];
            
            mockConnection.query
                .mockResolvedValueOnce([mockSkills])      // getEventRequiredSkills
                .mockResolvedValueOnce([mockVolunteerSkills]); // volunteer skills
            
            const result = await EventSignupModelDB.hasRequiredSkills(7, 1);
            
            expect(result.hasSkills).toBe(true);
            expect(result.matchingSkills).toEqual([1]);
        });

        test('should return false if volunteer missing required skills', async () => {
            const mockSkills = [{ Skills_id: 3, Is_required: true }];
            
            mockConnection.query
                .mockResolvedValueOnce([mockSkills])
                .mockResolvedValueOnce([[]]);  // No matching skills
            
            const result = await EventSignupModelDB.hasRequiredSkills(7, 1);
            
            expect(result.hasSkills).toBe(false);
            expect(result.matchingSkills).toEqual([]);
        });

        test('should return true if no required skills', async () => {
            mockConnection.query.mockResolvedValueOnce([[]]);  // No required skills
            
            const result = await EventSignupModelDB.hasRequiredSkills(7, 1);
            
            expect(result.hasSkills).toBe(true);
        });
    });

    describe('checkTimeConflict', () => {
        test('should detect time conflict with existing signup', async () => {
            const newEvent = {
                Event_id: 2,
                Date: '2025-12-01',
                Start_time: '2025-12-01T10:00:00',
                end_time: '2025-12-01T12:00:00'
            };
            
            const existingEvent = {
                Event_id: 1,
                Event_name: 'Existing Event',
                Start_time: '2025-12-01T11:00:00',
                end_time: '2025-12-01T13:00:00'
            };
            
            mockConnection.query
                .mockResolvedValueOnce([[newEvent]])      // getEventById
                .mockResolvedValueOnce([[existingEvent]]); // existing signups
            
            const result = await EventSignupModelDB.checkTimeConflict(7, 2);
            
            expect(result.hasConflict).toBe(true);
            expect(result.conflictingEvent).toEqual(existingEvent);
        });

        test('should return no conflict if times do not overlap', async () => {
            const newEvent = {
                Event_id: 2,
                Date: '2025-12-01',
                Start_time: '2025-12-01T14:00:00',
                end_time: '2025-12-01T16:00:00'
            };
            
            const existingEvent = {
                Event_id: 1,
                Start_time: '2025-12-01T09:00:00',
                end_time: '2025-12-01T11:00:00'
            };
            
            mockConnection.query
                .mockResolvedValueOnce([[newEvent]])
                .mockResolvedValueOnce([[existingEvent]]);
            
            const result = await EventSignupModelDB.checkTimeConflict(7, 2);
            
            expect(result.hasConflict).toBe(false);
        });

        test('should return no conflict if no existing signups', async () => {
            const newEvent = {
                Event_id: 2,
                Date: '2025-12-01',
                Start_time: '2025-12-01T10:00:00',
                end_time: '2025-12-01T12:00:00'
            };
            
            mockConnection.query
                .mockResolvedValueOnce([[newEvent]])
                .mockResolvedValueOnce([[]]);  // No existing events
            
            const result = await EventSignupModelDB.checkTimeConflict(7, 2);
            
            expect(result.hasConflict).toBe(false);
        });
    });

    describe('isEventFull', () => {
        test('should return true if event at capacity', async () => {
            const mockEvent = { Event_id: 1, Max_capacity: 20 };
            
            mockConnection.query
                .mockResolvedValueOnce([[mockEvent]])    // getEventById
                .mockResolvedValueOnce([[{ count: 20 }]]); // signup count
            
            const result = await EventSignupModelDB.isEventFull(1);
            
            expect(result).toBe(true);
        });

        test('should return false if event has capacity', async () => {
            const mockEvent = { Event_id: 1, Max_capacity: 20 };
            
            mockConnection.query
                .mockResolvedValueOnce([[mockEvent]])
                .mockResolvedValueOnce([[{ count: 15 }]]);
            
            const result = await EventSignupModelDB.isEventFull(1);
            
            expect(result).toBe(false);
        });

        test('should return false if no capacity limit', async () => {
            const mockEvent = { Event_id: 1, Max_capacity: null };
            
            mockConnection.query.mockResolvedValueOnce([[mockEvent]]);
            
            const result = await EventSignupModelDB.isEventFull(1);
            
            expect(result).toBe(false);
        });
    });

    describe('isSkillSlotFull', () => {
        test('should return true if skill slot full', async () => {
            mockConnection.query
                .mockResolvedValueOnce([[{ Needed_count: 10 }]]) // skill requirement
                .mockResolvedValueOnce([[{ count: 10 }]]);       // current signups
            
            const result = await EventSignupModelDB.isSkillSlotFull(1, 1);
            
            expect(result).toBe(true);
        });

        test('should return false if skill slot has space', async () => {
            mockConnection.query
                .mockResolvedValueOnce([[{ Needed_count: 10 }]])
                .mockResolvedValueOnce([[{ count: 5 }]]);
            
            const result = await EventSignupModelDB.isSkillSlotFull(1, 1);
            
            expect(result).toBe(false);
        });

        test('should return false if unlimited spots', async () => {
            mockConnection.query
                .mockResolvedValueOnce([[{ Needed_count: null }]]);
            
            const result = await EventSignupModelDB.isSkillSlotFull(1, 1);
            
            expect(result).toBe(false);
        });
    });

    // ============================================
    // SIGNUP OPERATIONS
    // ============================================

    describe('createSignup', () => {
        test('should create signup successfully', async () => {
            const mockEvent = { 
                Event_id: 1, 
                Date: '2025-12-01', 
                Start_time: '2025-12-01T10:00:00', 
                end_time: '2025-12-01T12:00:00',
                Max_capacity: 20
            };
            const mockRequiredSkills = [{ Skills_id: 1, Is_required: true }];
            
            mockConnection.query
                // checkIfRegistered
                .mockResolvedValueOnce([[]]) 
                
                // isEventFull - getEventById
                .mockResolvedValueOnce([[mockEvent]]) 
                
                // isEventFull - getEventSignupCount
                .mockResolvedValueOnce([[{ count: 10 }]]) 
                
                // hasRequiredSkills - getEventRequiredSkills
                .mockResolvedValueOnce([mockRequiredSkills]) 
                
                // hasRequiredSkills - volunteer has the skill
                .mockResolvedValueOnce([[{ Skills_id: 1 }]]) 
                
                // isSkillSlotFull - getSkillSpotsAvailable - skill requirement
                .mockResolvedValueOnce([[{ Needed_count: 10 }]]) 
                
                // isSkillSlotFull - getSkillSpotsAvailable - current signups (5/10 - has space!)
                .mockResolvedValueOnce([[{ count: 5 }]]) 
                
                // checkTimeConflict - getEventById
                .mockResolvedValueOnce([[mockEvent]]) 
                
                // checkTimeConflict - no existing signups on that date
                .mockResolvedValueOnce([[]]) 
                
                // INSERT signup
                .mockResolvedValueOnce([{ insertId: 1 }]); 
            
            const result = await EventSignupModelDB.createSignup(7, 1, 1);
            
            expect(result).toEqual({
                Signup_id: 1,
                Volunteer_id: 7,
                Event_id: 1,
                Registered_skill_id: 1,
                Status: 'registered'
            });
            
            // Success! Function returned the correct result
            expect(result.Signup_id).toBe(1);
            expect(mockConnection.query).toHaveBeenCalledTimes(10);
        });

        test('should throw error if already registered', async () => {
            mockConnection.query.mockResolvedValueOnce([[{ Signup_id: 1 }]]); // Already registered
            
            await expect(EventSignupModelDB.createSignup(7, 1, 1))
                .rejects.toThrow('Already registered for this event');
        });

        test('should throw error if event full', async () => {
            mockConnection.query
                .mockResolvedValueOnce([[]]) // Not registered
                .mockResolvedValueOnce([[{ Event_id: 1, Max_capacity: 20 }]]) // getEventById
                .mockResolvedValueOnce([[{ count: 20 }]]); // At capacity
            
            await expect(EventSignupModelDB.createSignup(7, 1, 1))
                .rejects.toThrow('Event is at full capacity');
        });

        test('should throw error if skill slot full', async () => {
            const mockEvent = { Event_id: 1, Max_capacity: null };
            const mockRequiredSkills = [{ Skills_id: 1, Is_required: true }];
            
            mockConnection.query
                .mockResolvedValueOnce([[]]) // checkIfRegistered - not registered
                .mockResolvedValueOnce([[mockEvent]]) // getEventById for capacity check
                .mockResolvedValueOnce([[{ count: 5 }]]) // getEventSignupCount
                .mockResolvedValueOnce([mockRequiredSkills]) // getEventRequiredSkills
                .mockResolvedValueOnce([[{ Skills_id: 1 }]]) // volunteer HAS skill 1
                .mockResolvedValueOnce([[{ Needed_count: 5 }]]) // skill requirement - needs 5
                .mockResolvedValueOnce([[{ count: 5 }]]); // current signups - FULL at 5
            
            await expect(EventSignupModelDB.createSignup(7, 1, 1))
                .rejects.toThrow('This skill slot is full');
        });

        test('should allow signup with null skill for no-skill-required events', async () => {
            const mockEvent = { Event_id: 1, Max_capacity: 30 };
            
            mockConnection.query
                .mockResolvedValueOnce([[]]) // Not registered
                .mockResolvedValueOnce([[{ count: 10 }]]) // Has space
                .mockResolvedValueOnce([[]]) // No required skills
                .mockResolvedValueOnce([[mockEvent]]) // getEventById
                .mockResolvedValueOnce([[]]) // No time conflict
                .mockResolvedValueOnce([{ insertId: 2 }]); // INSERT
            
            const result = await EventSignupModelDB.createSignup(7, 1, null);
            
            expect(result.Registered_skill_id).toBeNull();
        });
    });

    describe('deleteSignup', () => {
        test('should delete signup successfully', async () => {
            mockConnection.query
                .mockResolvedValueOnce([[{ Signup_id: 1, Volunteer_id: 7 }]]) // Exists
                .mockResolvedValueOnce([{ affectedRows: 1 }]); // DELETE
            
            const result = await EventSignupModelDB.deleteSignup(1, 7);
            
            expect(result).toEqual({
                success: true,
                message: 'Successfully unregistered from event'
            });
        });

        test('should throw error if signup not found', async () => {
            mockConnection.query.mockResolvedValueOnce([[]]); // Not found
            
            await expect(EventSignupModelDB.deleteSignup(999, 7))
                .rejects.toThrow('Signup not found or does not belong to this volunteer');
        });

        test('should throw error if signup belongs to different volunteer', async () => {
            mockConnection.query.mockResolvedValueOnce([[]]);
            
            await expect(EventSignupModelDB.deleteSignup(1, 999))
                .rejects.toThrow('Signup not found or does not belong to this volunteer');
        });
    });

    // ============================================
    // FILTERED QUERIES
    // ============================================

    describe('getAvailableEventsForVolunteer', () => {
        test('should return events volunteer qualifies for', async () => {
            const mockVolunteerSkills = [{ Skills_id: 1 }];
            const mockEvents = [
                { Event_id: 1, Event_name: 'Food Drive', Date: '2025-12-01', Max_capacity: 20 }
            ];
            const mockEventWithSkills = {
                Event_id: 1,
                Event_name: 'Food Drive',
                required_skills: []
            };
            
            mockConnection.query
                .mockResolvedValueOnce([mockVolunteerSkills]) // Volunteer skills
                .mockResolvedValueOnce([mockEvents])           // getUpcomingEvents
                .mockResolvedValueOnce([[]])                   // getVolunteerSignups - no signups
                .mockResolvedValueOnce([[{ count: 10 }]])      // getEventSignupCount - not full
                .mockResolvedValueOnce([[]]);                  // getEventRequiredSkills - no required skills
            
            // Mock getEventWithSkills
            mockConnection.query
                .mockResolvedValueOnce([[mockEvents[0]]])      // getEventById
                .mockResolvedValueOnce([[]]);                  // skills query - no required skills
            
            const result = await EventSignupModelDB.getAvailableEventsForVolunteer(7);
            
            expect(result.length).toBe(1);
            expect(result[0]).toHaveProperty('Event_name', 'Food Drive');
        });

        test('should exclude already registered events', async () => {
            const mockVolunteerSkills = [{ Skills_id: 1 }];
            const mockEvents = [{ Event_id: 1, Event_name: 'Food Drive' }];
            const mockMySignups = [{ Event_id: 1 }];
            
            mockConnection.query
                .mockResolvedValueOnce([mockVolunteerSkills])
                .mockResolvedValueOnce([mockEvents])
                .mockResolvedValueOnce([mockMySignups]); // Already registered
            
            const result = await EventSignupModelDB.getAvailableEventsForVolunteer(7);
            
            expect(result).toEqual([]);
        });
    });

    describe('getOtherEventsForVolunteer', () => {
        test('should return events volunteer does not qualify for', async () => {
            const mockVolunteerSkills = [{ Skills_id: 1 }]; // Only has Cooking
            const mockEvents = [
                { Event_id: 2, Event_name: 'Warehouse', Max_capacity: 15 }
            ];
            const mockRequiredSkills = [{ Skills_id: 3 }]; // Needs Heavy Lifting
            
            mockConnection.query
                .mockResolvedValueOnce([mockVolunteerSkills])
                .mockResolvedValueOnce([mockEvents])
                .mockResolvedValueOnce([[]])                  // No signups
                .mockResolvedValueOnce([mockRequiredSkills])  // Required skills
                .mockResolvedValueOnce([[mockEvents[0]]])     // getEventById
                .mockResolvedValueOnce([mockRequiredSkills]); // Skills details
            
            const result = await EventSignupModelDB.getOtherEventsForVolunteer(7);
            
            expect(result.length).toBeGreaterThan(0);
        });

        test('should exclude events with no required skills', async () => {
            const mockVolunteerSkills = [{ Skills_id: 1 }];
            const mockEvents = [{ Event_id: 1, Event_name: 'Open Event' }];
            
            mockConnection.query
                .mockResolvedValueOnce([mockVolunteerSkills])
                .mockResolvedValueOnce([mockEvents])
                .mockResolvedValueOnce([[]])
                .mockResolvedValueOnce([[]]); // No required skills
            
            const result = await EventSignupModelDB.getOtherEventsForVolunteer(7);
            
            expect(result).toEqual([]);
        });
    });
});