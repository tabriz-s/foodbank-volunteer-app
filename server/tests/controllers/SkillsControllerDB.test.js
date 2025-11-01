const SkillsControllerDB = require('../../src/controllers/SkillsControllerDB');
const SkillsDB = require('../../src/models/SkillsModelDB');
const VolunteerSkillsDB = require('../../src/models/VolunteerSkillsModelDB');

// Mock the database
jest.mock('../../src/models/SkillsModelDB');
jest.mock('../../src/models/VolunteerSkillsModelDB');

describe('SkillsControllerDB', () => {
    const mockReq = (params = {}) => ({ params });
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnThis();
        res.json = jest.fn().mockReturnThis();
        return res;
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // turn off console.error during tests
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    describe('getAllSkillsDB', () => {
        test('should return all skills from database', async () => {
            const mockSkills = [
                { Skills_id: 1, Description: 'Cooking', Category: 'Food_Preparation' },
                { Skills_id: 2, Description: 'Driving', Category: 'Transportation' }
            ];

            SkillsDB.getAllSkills.mockResolvedValue(mockSkills);

            const req = mockReq();
            const res = mockRes();

            await SkillsControllerDB.getAllSkillsDB(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                source: 'Azure MySQL Database',
                count: 2,
                data: mockSkills
            });
        });

        test('should return empty array when no skills found', async () => {
            SkillsDB.getAllSkills.mockResolvedValue([]);

            const req = mockReq();
            const res = mockRes();

            await SkillsControllerDB.getAllSkillsDB(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                source: 'Azure MySQL Database',
                count: 0,
                data: []
            });
        });

        test('should handle database errors', async () => {
            const mockError = new Error('Database connection failed');
            SkillsDB.getAllSkills.mockRejectedValue(mockError);

            const req = mockReq();
            const res = mockRes();

            await SkillsControllerDB.getAllSkillsDB(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to retrieve skills from database',
                error: 'Database connection failed'
            });
        });

        test('should log errors to console', async () => {
            const mockError = new Error('Test error');
            SkillsDB.getAllSkills.mockRejectedValue(mockError);

            const req = mockReq();
            const res = mockRes();

            await SkillsControllerDB.getAllSkillsDB(req, res);

            expect(console.error).toHaveBeenCalledWith('Error in getAllSkillsDB:', mockError);
        });
    });

    describe('getSkillByIdDB', () => {
        test('should return skill when found', async () => {
            const mockSkill = { Skills_id: 1, Description: 'Cooking', Category: 'Food_Preparation' };
            SkillsDB.getSkillById.mockResolvedValue(mockSkill);

            const req = mockReq({ id: '1' });
            const res = mockRes();

            await SkillsControllerDB.getSkillByIdDB(req, res);

            expect(SkillsDB.getSkillById).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                source: 'Azure MySQL Database',
                data: mockSkill
            });
        });

        test('should return 404 when skill not found', async () => {
            SkillsDB.getSkillById.mockResolvedValue(null);

            const req = mockReq({ id: '999' });
            const res = mockRes();

            await SkillsControllerDB.getSkillByIdDB(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Skill not found in database'
            });
        });

        test('should return 404 when skill is undefined', async () => {
            SkillsDB.getSkillById.mockResolvedValue(undefined);

            const req = mockReq({ id: '0' });
            const res = mockRes();

            await SkillsControllerDB.getSkillByIdDB(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('should handle database errors', async () => {
            const mockError = new Error('Query failed');
            SkillsDB.getSkillById.mockRejectedValue(mockError);

            const req = mockReq({ id: '1' });
            const res = mockRes();

            await SkillsControllerDB.getSkillByIdDB(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to retrieve skill from database',
                error: 'Query failed'
            });
        });

        test('should work with different skill IDs', async () => {
            const mockSkill = { Skills_id: 5, Description: 'CDL License', Category: 'Transportation' };
            SkillsDB.getSkillById.mockResolvedValue(mockSkill);

            const req = mockReq({ id: '5' });
            const res = mockRes();

            await SkillsControllerDB.getSkillByIdDB(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: mockSkill
                })
            );
        });

        test('should log errors to console', async () => {
            const mockError = new Error('Test error');
            SkillsDB.getSkillById.mockRejectedValue(mockError);

            const req = mockReq({ id: '1' });
            const res = mockRes();

            await SkillsControllerDB.getSkillByIdDB(req, res);

            expect(console.error).toHaveBeenCalledWith('Error in getSkillByIdDB:', mockError);
        });
    });

    describe('getVolunteerSkillsDB', () => {
        test('should return volunteer skills with details', async () => {
            const mockSkills = [
                { Skills_id: 1, Description: 'Cooking', volunteer_id: 5 },
                { Skills_id: 2, Description: 'Driving', volunteer_id: 5 }
            ];

            VolunteerSkillsDB.getVolunteerSkillsWithDetails.mockResolvedValue(mockSkills);

            const req = mockReq({ id: '5' });
            const res = mockRes();

            await SkillsControllerDB.getVolunteerSkillsDB(req, res);

            expect(VolunteerSkillsDB.getVolunteerSkillsWithDetails).toHaveBeenCalledWith('5');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                source: 'Azure MySQL Database',
                volunteer_id: '5',
                count: 2,
                data: mockSkills
            });
        });

        test('should return empty array when volunteer has no skills', async () => {
            VolunteerSkillsDB.getVolunteerSkillsWithDetails.mockResolvedValue([]);

            const req = mockReq({ id: '10' });
            const res = mockRes();

            await SkillsControllerDB.getVolunteerSkillsDB(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                source: 'Azure MySQL Database',
                volunteer_id: '10',
                count: 0,
                data: []
            });
        });

        test('should handle database errors', async () => {
            const mockError = new Error('JOIN query failed');
            VolunteerSkillsDB.getVolunteerSkillsWithDetails.mockRejectedValue(mockError);

            const req = mockReq({ id: '5' });
            const res = mockRes();

            await SkillsControllerDB.getVolunteerSkillsDB(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to retrieve volunteer skills from database',
                error: 'JOIN query failed'
            });
        });

        test('should work with different volunteer IDs', async () => {
            const mockSkills = [{ Skills_id: 3, Description: 'Organizing' }];
            VolunteerSkillsDB.getVolunteerSkillsWithDetails.mockResolvedValue(mockSkills);

            const req = mockReq({ id: '99' });
            const res = mockRes();

            await SkillsControllerDB.getVolunteerSkillsDB(req, res);

            expect(VolunteerSkillsDB.getVolunteerSkillsWithDetails).toHaveBeenCalledWith('99');
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    volunteer_id: '99',
                    count: 1
                })
            );
        });

        test('should log errors to console', async () => {
            const mockError = new Error('Test error');
            VolunteerSkillsDB.getVolunteerSkillsWithDetails.mockRejectedValue(mockError);

            const req = mockReq({ id: '5' });
            const res = mockRes();

            await SkillsControllerDB.getVolunteerSkillsDB(req, res);

            expect(console.error).toHaveBeenCalledWith('Error in getVolunteerSkillsDB:', mockError);
        });

        test('should handle string volunteer IDs', async () => {
            VolunteerSkillsDB.getVolunteerSkillsWithDetails.mockResolvedValue([]);

            const req = mockReq({ id: 'abc' });
            const res = mockRes();

            await SkillsControllerDB.getVolunteerSkillsDB(req, res);

            expect(VolunteerSkillsDB.getVolunteerSkillsWithDetails).toHaveBeenCalledWith('abc');
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});