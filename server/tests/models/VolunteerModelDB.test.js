const VolunteerModelDB = require('../../src/models/VolunteerModelDB');
const { getConnection } = require('../../src/config/database');

// Mock the database connection
jest.mock('../../src/config/database');

describe('VolunteerModelDB', () => {
    let mockConnection;
    
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        
        // Create mock connection object
        mockConnection = {
            query: jest.fn()
        };
        
        // Mock getConnection to return our mock connection
        getConnection.mockResolvedValue(mockConnection);
    });

    describe('getAllVolunteers', () => {
        test('should return array of all volunteers', async () => {
            const mockVolunteers = [
                { Volunteer_id: 1, First_name: 'Michael', Last_name: 'Pearson' },
                { Volunteer_id: 2, First_name: 'Sarah', Last_name: 'Johnson' }
            ];
            
            mockConnection.query.mockResolvedValue([mockVolunteers]);
            
            const result = await VolunteerModelDB.getAllVolunteers();
            
            expect(result).toEqual(mockVolunteers);
            expect(mockConnection.query).toHaveBeenCalledWith('SELECT * FROM volunteers');
        });

        test('should throw error if database query fails', async () => {
            mockConnection.query.mockRejectedValue(new Error('Database error'));
            
            await expect(VolunteerModelDB.getAllVolunteers()).rejects.toThrow('Database error');
        });
    });

    describe('getVolunteerById', () => {
        test('should return volunteer by volunteer_id', async () => {
            const mockVolunteer = { 
                Volunteer_id: 1, 
                User_id: 1,
                First_name: 'Michael', 
                Last_name: 'Pearson',
                City: 'Houston'
            };
            
            mockConnection.query.mockResolvedValue([[mockVolunteer]]);
            
            const result = await VolunteerModelDB.getVolunteerById(1);
            
            expect(result).toEqual(mockVolunteer);
            expect(mockConnection.query).toHaveBeenCalledWith(
                'SELECT * FROM volunteers WHERE Volunteer_id = ?',
                [1]
            );
        });

        test('should return undefined for non-existent volunteer', async () => {
            mockConnection.query.mockResolvedValue([[]]);
            
            const result = await VolunteerModelDB.getVolunteerById(999);
            
            expect(result).toBeUndefined();
        });

        test('should throw error if database query fails', async () => {
            mockConnection.query.mockRejectedValue(new Error('Database error'));
            
            await expect(VolunteerModelDB.getVolunteerById(1)).rejects.toThrow('Database error');
        });
    });

    describe('getVolunteerWithUser_id', () => {
        test('should return volunteer by user_id', async () => {
            const mockVolunteer = { 
                Volunteer_id: 1, 
                User_id: 1,
                First_name: 'Michael', 
                Last_name: 'Pearson'
            };
            
            mockConnection.query.mockResolvedValue([[mockVolunteer]]);
            
            const result = await VolunteerModelDB.getVolunteerWithUser_id(1);
            
            expect(result).toEqual(mockVolunteer);
            expect(mockConnection.query).toHaveBeenCalledWith(
                'SELECT * FROM volunteers WHERE User_id = ?',
                [1]
            );
        });

        test('should return undefined for non-existent user_id', async () => {
            mockConnection.query.mockResolvedValue([[]]);
            
            const result = await VolunteerModelDB.getVolunteerWithUser_id(999);
            
            expect(result).toBeUndefined();
        });
    });

    describe('volunteerExists', () => {
        test('should return true if volunteer exists', async () => {
            const mockVolunteer = { Volunteer_id: 1, First_name: 'Michael' };
            mockConnection.query.mockResolvedValue([[mockVolunteer]]);
            
            const result = await VolunteerModelDB.volunteerExists(1);
            
            expect(result).toBe(true);
        });

        test('should return false if volunteer does not exist', async () => {
            mockConnection.query.mockResolvedValue([[]]);
            
            const result = await VolunteerModelDB.volunteerExists(999);
            
            expect(result).toBe(false);
        });

        test('should return false if database error occurs', async () => {
            mockConnection.query.mockRejectedValue(new Error('Database error'));
            
            const result = await VolunteerModelDB.volunteerExists(1);
            
            expect(result).toBe(false);
        });
    });

    describe('userHasProfile', () => {
        test('should return true if user has profile', async () => {
            const mockVolunteer = { User_id: 1, First_name: 'Michael' };
            mockConnection.query.mockResolvedValue([[mockVolunteer]]);
            
            const result = await VolunteerModelDB.userHasProfile(1);
            
            expect(result).toBe(true);
        });

        test('should return false if user does not have profile', async () => {
            mockConnection.query.mockResolvedValue([[]]);
            
            const result = await VolunteerModelDB.userHasProfile(999);
            
            expect(result).toBe(false);
        });
    });

    describe('createVolunteer', () => {
        test('should create new volunteer successfully', async () => {
            const volunteerData = {
                User_id: 10,
                First_name: 'New',
                Middle_name: 'Test',
                Last_name: 'User',
                Address_1: '123 Test St',
                Address_2: 'Apt 1',
                City: 'Houston',
                State: 'TX',
                Zip_code: '77001',
                Phone_number: '(555) 123-4567',
                Available_days: 'monday,wednesday',
                Preferences: 'Morning shifts'
            };

            // Mock userHasProfile check (no existing profile)
            mockConnection.query
                .mockResolvedValueOnce([[]])  // userHasProfile check
                .mockResolvedValueOnce([{ insertId: 10 }])  // INSERT
                .mockResolvedValueOnce([[{ ...volunteerData, Volunteer_id: 10 }]]);  // getVolunteerById
            
            const result = await VolunteerModelDB.createVolunteer(volunteerData);
            
            expect(result).toHaveProperty('Volunteer_id', 10);
            expect(result.First_name).toBe('New');
            expect(mockConnection.query).toHaveBeenCalledTimes(3);
        });

        test('should throw error if user already has profile', async () => {
            const volunteerData = {
                User_id: 1,
                First_name: 'Test',
                Last_name: 'User',
                Address_1: '123 Test St',
                City: 'Houston',
                State: 'TX',
                Zip_code: '77001',
                Phone_number: '555-1234',
                Available_days: 'monday'
            };

            // Mock userHasProfile check (profile exists)
            mockConnection.query.mockResolvedValueOnce([[{ User_id: 1 }]]);
            
            await expect(VolunteerModelDB.createVolunteer(volunteerData))
                .rejects.toThrow('User already has a volunteer profile');
        });

        test('should handle optional fields as null', async () => {
            const volunteerData = {
                User_id: 11,
                First_name: 'Simple',
                Last_name: 'User',
                Address_1: '456 Simple St',
                City: 'Dallas',
                State: 'TX',
                Zip_code: '75001',
                Phone_number: '555-5555',
                Available_days: 'tuesday'
                // No Middle_name, Address_2, emergency_contact, or Preferences
            };

            mockConnection.query
                .mockResolvedValueOnce([[]])  // userHasProfile
                .mockResolvedValueOnce([{ insertId: 11 }])  // INSERT
                .mockResolvedValueOnce([[{ ...volunteerData, Volunteer_id: 11 }]]);
            
            const result = await VolunteerModelDB.createVolunteer(volunteerData);
            
            expect(result).toBeDefined();
            expect(result.Volunteer_id).toBe(11);
        });
    });

    describe('updateVolunteer', () => {
        test('should update volunteer fields successfully', async () => {
            const updates = {
                City: 'Austin',
                Phone_number: '(555) 999-8888'
            };

            const updatedVolunteer = {
                Volunteer_id: 1,
                First_name: 'Michael',
                City: 'Austin',
                Phone_number: '(555) 999-8888'
            };

            mockConnection.query
                .mockResolvedValueOnce([{ affectedRows: 1 }])  // UPDATE
                .mockResolvedValueOnce([[updatedVolunteer]]);  // getVolunteerById
            
            const result = await VolunteerModelDB.updateVolunteer(1, updates);
            
            expect(result.City).toBe('Austin');
            expect(result.Phone_number).toBe('(555) 999-8888');
        });

        test('should throw error if no fields to update', async () => {
            await expect(VolunteerModelDB.updateVolunteer(1, {}))
                .rejects.toThrow('No valid fields to update');
        });

        test('should throw error if volunteer not found', async () => {
            const updates = { City: 'Austin' };
            mockConnection.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
            
            await expect(VolunteerModelDB.updateVolunteer(999, updates))
                .rejects.toThrow('Volunteer not found');
        });

        test('should only update specified fields', async () => {
            const updates = { State: 'CA' };

            mockConnection.query
                .mockResolvedValueOnce([{ affectedRows: 1 }])
                .mockResolvedValueOnce([[{ Volunteer_id: 1, State: 'CA' }]]);
            
            await VolunteerModelDB.updateVolunteer(1, updates);
            
            const updateCall = mockConnection.query.mock.calls[0];
            expect(updateCall[0]).toContain('State = ?');
            expect(updateCall[0]).not.toContain('City');
        });
    });

    describe('updateVolunteerByUserId', () => {
        test('should update volunteer by user_id', async () => {
            const updates = { City: 'Dallas' };
            const mockVolunteer = { Volunteer_id: 1, User_id: 1 };
            const updatedVolunteer = { ...mockVolunteer, City: 'Dallas' };

            mockConnection.query
                .mockResolvedValueOnce([[mockVolunteer]])  // getVolunteerWithUser_id
                .mockResolvedValueOnce([{ affectedRows: 1 }])  // UPDATE
                .mockResolvedValueOnce([[updatedVolunteer]]);  // getVolunteerById
            
            const result = await VolunteerModelDB.updateVolunteerByUserId(1, updates);
            
            expect(result.City).toBe('Dallas');
        });

        test('should throw error if user profile not found', async () => {
            mockConnection.query.mockResolvedValueOnce([[]]);
            
            await expect(VolunteerModelDB.updateVolunteerByUserId(999, { City: 'Dallas' }))
                .rejects.toThrow('Volunteer profile not found for this user');
        });
    });

    describe('deleteVolunteer', () => {
        test('should delete volunteer successfully', async () => {
            mockConnection.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
            
            const result = await VolunteerModelDB.deleteVolunteer(1);
            
            expect(result).toEqual({
                message: 'Volunteer deleted successfully',
                affectedRows: 1
            });
            expect(mockConnection.query).toHaveBeenCalledWith(
                'DELETE FROM volunteers WHERE Volunteer_id = ?',
                [1]
            );
        });

        test('should throw error if volunteer not found', async () => {
            mockConnection.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
            
            await expect(VolunteerModelDB.deleteVolunteer(999))
                .rejects.toThrow('Volunteer not found');
        });
    });
});