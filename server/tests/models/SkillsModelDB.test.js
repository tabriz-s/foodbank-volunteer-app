const SkillsModelDB = require('../../src/models/SkillsModelDB');
const database = require('../../src/config/database');

// Mock the entire database module
jest.mock('../../src/config/database');

describe('SkillsModelDB', () => {
    let mockConnection;

    beforeEach(() => {
        // Create mock connection
        mockConnection = {
            query: jest.fn()
        };
        
        // Mock getConnection to return our mock
        database.getConnection.mockResolvedValue(mockConnection);
        
        // Suppress console.error during tests
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
        console.error.mockRestore();
    });

    describe('getAllSkills', () => {
        test('should return all skills from database', async () => {
            const mockSkills = [
                { Skills_id: 1, Description: 'Cooking', Category: 'Food_Preparation' },
                { Skills_id: 2, Description: 'Driving', Category: 'Transportation' },
                { Skills_id: 3, Description: 'Organizing', Category: 'Management' }
            ];

            mockConnection.query.mockResolvedValue([mockSkills]);

            const result = await SkillsModelDB.getAllSkills();

            expect(database.getConnection).toHaveBeenCalled();
            expect(mockConnection.query).toHaveBeenCalledWith(
                'SELECT * FROM SKILLS ORDER BY Category, Description'
            );
            expect(result).toEqual(mockSkills);
            expect(result.length).toBe(3);
        });

        test('should return empty array when no skills exist', async () => {
            mockConnection.query.mockResolvedValue([[]]);

            const result = await SkillsModelDB.getAllSkills();

            expect(result).toEqual([]);
            expect(Array.isArray(result)).toBe(true);
        });

        test('should throw error and log when database query fails', async () => {
            const mockError = new Error('Database connection failed');
            mockConnection.query.mockRejectedValue(mockError);

            await expect(SkillsModelDB.getAllSkills()).rejects.toThrow('Database connection failed');
            expect(console.error).toHaveBeenCalledWith('Error getting all skills:', mockError);
        });

        test('should handle database timeout errors', async () => {
            const timeoutError = new Error('Query timeout');
            mockConnection.query.mockRejectedValue(timeoutError);

            await expect(SkillsModelDB.getAllSkills()).rejects.toThrow('Query timeout');
            expect(console.error).toHaveBeenCalled();
        });

        test('should call database connection once', async () => {
            mockConnection.query.mockResolvedValue([[]]);

            await SkillsModelDB.getAllSkills();

            expect(database.getConnection).toHaveBeenCalledTimes(1);
        });
    });

    describe('getSkillById', () => {
        test('should return skill when found', async () => {
            const mockSkill = { Skills_id: 1, Description: 'Cooking', Category: 'Food_Preparation' };
            mockConnection.query.mockResolvedValue([[mockSkill]]);

            const result = await SkillsModelDB.getSkillById(1);

            expect(mockConnection.query).toHaveBeenCalledWith(
                'SELECT * FROM SKILLS WHERE Skills_id = ?',
                [1]
            );
            expect(result).toEqual(mockSkill);
            expect(result.Skills_id).toBe(1);
        });

        test('should return undefined when skill not found', async () => {
            mockConnection.query.mockResolvedValue([[]]);

            const result = await SkillsModelDB.getSkillById(999);

            expect(result).toBeUndefined();
        });

        test('should work with string skill ID', async () => {
            const mockSkill = { Skills_id: 5, Description: 'CDL License', Category: 'Transportation' };
            mockConnection.query.mockResolvedValue([[mockSkill]]);

            const result = await SkillsModelDB.getSkillById('5');

            expect(mockConnection.query).toHaveBeenCalledWith(
                'SELECT * FROM SKILLS WHERE Skills_id = ?',
                ['5']
            );
            expect(result).toEqual(mockSkill);
        });

        test('should throw error and log when database query fails', async () => {
            const mockError = new Error('Query failed');
            mockConnection.query.mockRejectedValue(mockError);

            await expect(SkillsModelDB.getSkillById(1)).rejects.toThrow('Query failed');
            expect(console.error).toHaveBeenCalledWith('Error getting skill by ID:', mockError);
        });

        test('should handle null skill ID', async () => {
            mockConnection.query.mockResolvedValue([[]]);

            const result = await SkillsModelDB.getSkillById(null);

            expect(mockConnection.query).toHaveBeenCalledWith(
                'SELECT * FROM SKILLS WHERE Skills_id = ?',
                [null]
            );
            expect(result).toBeUndefined();
        });

        test('should handle different skill IDs', async () => {
            const mockSkill = { Skills_id: 7, Description: 'Forklift', Category: 'Equipment' };
            mockConnection.query.mockResolvedValue([[mockSkill]]);

            const result = await SkillsModelDB.getSkillById(7);

            expect(result.Skills_id).toBe(7);
            expect(result.Description).toBe('Forklift');
            expect(result.Category).toBe('Equipment');
        });

        test('should return first result from array', async () => {
            const mockSkills = [
                { Skills_id: 1, Description: 'Skill1' },
                { Skills_id: 2, Description: 'Skill2' }
            ];
            mockConnection.query.mockResolvedValue([mockSkills]);

            const result = await SkillsModelDB.getSkillById(1);

            expect(result).toEqual(mockSkills[0]);
        });
    });

    describe('skillExists', () => {
        test('should return true when skill exists', async () => {
            const mockSkill = { Skills_id: 1, Description: 'Cooking' };
            mockConnection.query.mockResolvedValue([[mockSkill]]);

            const result = await SkillsModelDB.skillExists(1);

            expect(result).toBe(true);
        });

        test('should return false when skill does not exist', async () => {
            mockConnection.query.mockResolvedValue([[]]);

            const result = await SkillsModelDB.skillExists(999);

            expect(result).toBe(false);
        });

        test('should return false and log error when database query fails', async () => {
            const mockError = new Error('Database error');
            mockConnection.query.mockRejectedValue(mockError);

            const result = await SkillsModelDB.skillExists(1);

            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalledWith('Error checking skill existence:', mockError);
        });

        test('should handle string skill IDs', async () => {
            const mockSkill = { Skills_id: 5, Description: 'CDL License' };
            mockConnection.query.mockResolvedValue([[mockSkill]]);

            const result = await SkillsModelDB.skillExists('5');

            expect(result).toBe(true);
        });

        test('should return false for null skill ID', async () => {
            mockConnection.query.mockResolvedValue([[]]);

            const result = await SkillsModelDB.skillExists(null);

            expect(result).toBe(false);
        });

        test('should return false for undefined skill', async () => {
            mockConnection.query.mockResolvedValue([[]]);

            const result = await SkillsModelDB.skillExists(undefined);

            expect(result).toBe(false);
        });

        test('should handle connection timeout and return false', async () => {
            mockConnection.query.mockRejectedValue(new Error('Connection timeout'));

            const result = await SkillsModelDB.skillExists(1);

            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalled();
        });

        test('should return true for existing skill with different IDs', async () => {
            for (let i = 1; i <= 5; i++) {
                mockConnection.query.mockResolvedValue([[{ Skills_id: i }]]);
                const result = await SkillsModelDB.skillExists(i);
                expect(result).toBe(true);
            }
        });

        test('should use getSkillById internally', async () => {
            mockConnection.query.mockResolvedValue([[{ Skills_id: 1 }]]);

            await SkillsModelDB.skillExists(1);

            // Should call the database query
            expect(mockConnection.query).toHaveBeenCalled();
        });
    });
});