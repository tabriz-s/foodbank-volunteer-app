// unit test for skills controller

const SkillsController = require('../../src/controllers/SkillsController');

describe('SkillsController', () => {

    describe('getAllSkills', () => {
        test('should return all skills with success response', () => {
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            SkillsController.getAllSkills(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.any(Array)
                })
            );
        });

        test('should return all 9 skills', () => {
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            SkillsController.getAllSkills(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.data).toHaveLength(9);
        });

        test('each skill should have required properties', () => {
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            SkillsController.getAllSkills(req, res);

            const response = res.json.mock.calls[0][0];
            response.data.forEach(skill => {
                expect(skill).toHaveProperty('Skills_id');
                expect(skill).toHaveProperty('Description');
                expect(skill).toHaveProperty('Category');
            });
        });

        test('should handle errors gracefully', () => {
            // Mock Skills.getAllSkills to throw error
            const Skills = require('../../src/models/SkillsModel');
            const originalGetAllSkills = Skills.getAllSkills;
            
            Skills.getAllSkills = jest.fn(() => {
                throw new Error('Database error');
            });

            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            SkillsController.getAllSkills(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.any(String)
                })
            );

            // Restore original function
            Skills.getAllSkills = originalGetAllSkills;
        });
    });

});