const VolunteerSkillsModelDB = require('../../src/models/VolunteerSkillsModelDB');
const { getConnection } = require('../../src/config/database');

// Mock the database connection
jest.mock('../../src/config/database');

describe('VolunteerSkillsModelDB', () => {
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

    describe('getVolunteerSkills', () => {
        test('should return all skills for a volunteer', async () => {
            const mockSkills = [
                { Volunteer_id: 1, Skills_id: 1, Experience_level: 'Intermediate', Date_acquired: '2023-01-15' },
                { Volunteer_id: 1, Skills_id: 3, Experience_level: 'Beginner', Date_acquired: '2023-03-20' }
            ];
            
            mockConnection.query.mockResolvedValue([mockSkills]);
            
            const result = await VolunteerSkillsModelDB.getVolunteerSkills(1);
            
            expect(result).toEqual(mockSkills);
            expect(mockConnection.query).toHaveBeenCalledWith(
                'SELECT * FROM volunteer_skills WHERE Volunteer_id = ?',
                [1]
            );
        });

        test('should return empty array for volunteer with no skills', async () => {
            mockConnection.query.mockResolvedValue([[]]);
            
            const result = await VolunteerSkillsModelDB.getVolunteerSkills(999);
            
            expect(result).toEqual([]);
        });

        test('should throw error if database query fails', async () => {
            mockConnection.query.mockRejectedValue(new Error('Database error'));
            
            await expect(VolunteerSkillsModelDB.getVolunteerSkills(1))
                .rejects.toThrow('Database error');
        });
    });

    describe('getVolunteerSkillsWithDetails', () => {
        test('should return skills with full details', async () => {
            const mockSkillsWithDetails = [
                {
                    Volunteer_id: 1,
                    Skills_id: 1,
                    Experience_level: 'Intermediate',
                    Date_acquired: '2023-01-15',
                    Description: 'Cooking',
                    Category: 'Food_Preparation'
                },
                {
                    Volunteer_id: 1,
                    Skills_id: 3,
                    Experience_level: 'Beginner',
                    Date_acquired: '2023-03-20',
                    Description: 'Heavy Lifting',
                    Category: 'Warehouse'
                }
            ];
            
            mockConnection.query.mockResolvedValue([mockSkillsWithDetails]);
            
            const result = await VolunteerSkillsModelDB.getVolunteerSkillsWithDetails(1);
            
            expect(result).toEqual(mockSkillsWithDetails);
            expect(result[0]).toHaveProperty('Description');
            expect(result[0]).toHaveProperty('Category');
            expect(mockConnection.query).toHaveBeenCalledWith(
                expect.stringContaining('INNER JOIN skills'),
                [1]
            );
        });

        test('should return empty array for volunteer with no skills', async () => {
            mockConnection.query.mockResolvedValue([[]]);
            
            const result = await VolunteerSkillsModelDB.getVolunteerSkillsWithDetails(999);
            
            expect(result).toEqual([]);
        });

        test('should order results by category and description', async () => {
            const mockSkills = [
                { Category: 'Distribution', Description: 'Customer Service' },
                { Category: 'Food_Preparation', Description: 'Cooking' },
                { Category: 'Warehouse', Description: 'Heavy Lifting' }
            ];
            
            mockConnection.query.mockResolvedValue([mockSkills]);
            
            const result = await VolunteerSkillsModelDB.getVolunteerSkillsWithDetails(1);
            
            expect(mockConnection.query).toHaveBeenCalledWith(
                expect.stringContaining('Order by s.Category, s.Description'),
                [1]
            );
        });
    });

    describe('volunteerHasSkill', () => {
        test('should return true if volunteer has skill', async () => {
            mockConnection.query.mockResolvedValue([[{ Volunteer_id: 1, Skills_id: 1 }]]);
            
            const result = await VolunteerSkillsModelDB.volunteerHasSkill(1, 1);
            
            expect(result).toBe(true);
            expect(mockConnection.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE Volunteer_id = ? AND Skills_id = ?'),
                [1, 1]
            );
        });

        test('should return false if volunteer does not have skill', async () => {
            mockConnection.query.mockResolvedValue([[]]);
            
            const result = await VolunteerSkillsModelDB.volunteerHasSkill(1, 999);
            
            expect(result).toBe(false);
        });

        test('should throw error if database query fails', async () => {
            mockConnection.query.mockRejectedValue(new Error('Database error'));
            
            await expect(VolunteerSkillsModelDB.volunteerHasSkill(1, 1))
                .rejects.toThrow('Database error');
        });
    });

    describe('addVolunteerSkill', () => {
        test('should add new skill successfully', async () => {
            // Mock volunteerHasSkill check (skill doesn't exist)
            mockConnection.query
                .mockResolvedValueOnce([[]])  // volunteerHasSkill returns false
                .mockResolvedValueOnce([{ insertId: 1 }]);  // INSERT
            
            const result = await VolunteerSkillsModelDB.addVolunteerSkill(1, 5, 'Beginner', '2024-01-01');
            
            expect(result).toEqual({
                Volunteer_id: 1,
                Skills_id: 5,
                Experience_level: 'Beginner',
                Date_acquired: '2024-01-01'
            });
            expect(mockConnection.query).toHaveBeenCalledTimes(2);
        });

        test('should throw error if skill already exists', async () => {
            // Mock volunteerHasSkill check (skill exists)
            mockConnection.query.mockResolvedValueOnce([[{ Volunteer_id: 1, Skills_id: 1 }]]);
            
            await expect(VolunteerSkillsModelDB.addVolunteerSkill(1, 1, 'Beginner', '2024-01-01'))
                .rejects.toThrow('Volunteer already has this skill');
        });

        test('should throw error if database insert fails', async () => {
            mockConnection.query
                .mockResolvedValueOnce([[]])  // volunteerHasSkill
                .mockRejectedValueOnce(new Error('Insert failed'));
            
            await expect(VolunteerSkillsModelDB.addVolunteerSkill(1, 5, 'Beginner', '2024-01-01'))
                .rejects.toThrow('Insert failed');
        });
    });

    describe('addMultipleSkills', () => {
        test('should add multiple skills successfully', async () => {
            const skills = [
                { skillId: 1, experienceLevel: 'Beginner', dateAcquired: '2024-01-01' },
                { skillId: 2, experienceLevel: 'Intermediate', dateAcquired: '2024-01-02' }
            ];

            mockConnection.query.mockResolvedValue([{ affectedRows: 2 }]);
            
            await VolunteerSkillsModelDB.addMultipleSkills(1, skills);
            
            expect(mockConnection.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO volunteer_skills'),
                expect.arrayContaining([
                    expect.arrayContaining([
                        [1, 1, 'Beginner', '2024-01-01'],
                        [1, 2, 'Intermediate', '2024-01-02']
                    ])
                ])
            );
        });

        test('should throw error if database insert fails', async () => {
            const skills = [{ skillId: 1, experienceLevel: 'Beginner', dateAcquired: '2024-01-01' }];
            
            mockConnection.query.mockRejectedValue(new Error('Bulk insert failed'));
            
            await expect(VolunteerSkillsModelDB.addMultipleSkills(1, skills))
                .rejects.toThrow('Bulk insert failed');
        });
    });

    describe('updateVolunteerSkill', () => {
        test('should update experience level successfully', async () => {
            const updates = { experienceLevel: 'Expert' };
            
            mockConnection.query.mockResolvedValue([{ affectedRows: 1 }]);
            
            const result = await VolunteerSkillsModelDB.updateVolunteerSkill(1, 1, updates);
            
            expect(result).toEqual({
                message: 'Skill updated successfully',
                affectedRows: 1
            });
            expect(mockConnection.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE volunteer_skills'),
                expect.arrayContaining(['Expert', 1, 1])
            );
        });

        test('should update date acquired successfully', async () => {
            const updates = { dateAcquired: '2024-06-01' };
            
            mockConnection.query.mockResolvedValue([{ affectedRows: 1 }]);
            
            const result = await VolunteerSkillsModelDB.updateVolunteerSkill(1, 1, updates);
            
            expect(result.message).toBe('Skill updated successfully');
            expect(mockConnection.query).toHaveBeenCalledWith(
                expect.stringContaining('Date_acquired = ?'),
                expect.arrayContaining(['2024-06-01', 1, 1])
            );
        });

        test('should update both fields successfully', async () => {
            const updates = { 
                experienceLevel: 'Intermediate', 
                dateAcquired: '2024-03-15' 
            };
            
            mockConnection.query.mockResolvedValue([{ affectedRows: 1 }]);
            
            await VolunteerSkillsModelDB.updateVolunteerSkill(1, 1, updates);
            
            expect(mockConnection.query).toHaveBeenCalledWith(
                expect.stringContaining('Experience_level = ?'),
                expect.arrayContaining(['Intermediate', '2024-03-15', 1, 1])
            );
        });

        test('should throw error if no fields to update', async () => {
            await expect(VolunteerSkillsModelDB.updateVolunteerSkill(1, 1, {}))
                .rejects.toThrow('No fields to update');
        });

        test('should throw error if skill not found', async () => {
            const updates = { experienceLevel: 'Expert' };
            mockConnection.query.mockResolvedValue([{ affectedRows: 0 }]);
            
            await expect(VolunteerSkillsModelDB.updateVolunteerSkill(1, 999, updates))
                .rejects.toThrow('Volunteer skill not found');
        });
    });

    describe('deleteVolunteerSkill', () => {
        test('should delete skill successfully', async () => {
            mockConnection.query.mockResolvedValue([{ affectedRows: 1 }]);
            
            const result = await VolunteerSkillsModelDB.deleteVolunteerSkill(1, 1);
            
            expect(result).toEqual({
                message: 'Skill removed successfully',
                affectedRows: 1
            });
            expect(mockConnection.query).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM volunteer_skills'),
                [1, 1]
            );
        });

        test('should throw error if skill not found', async () => {
            mockConnection.query.mockResolvedValue([{ affectedRows: 0 }]);
            
            await expect(VolunteerSkillsModelDB.deleteVolunteerSkill(1, 999))
                .rejects.toThrow('Volunteer skill not found');
        });

        test('should throw error if database delete fails', async () => {
            mockConnection.query.mockRejectedValue(new Error('Delete failed'));
            
            await expect(VolunteerSkillsModelDB.deleteVolunteerSkill(1, 1))
                .rejects.toThrow('Delete failed');
        });
    });

    describe('deleteAllVolunteerSkills', () => {
        test('should delete all skills for volunteer', async () => {
            mockConnection.query.mockResolvedValue([{ affectedRows: 3 }]);
            
            const result = await VolunteerSkillsModelDB.deleteAllVolunteerSkills(1);
            
            expect(result).toEqual({
                message: 'All skills removed',
                affectedRows: 3
            });
            expect(mockConnection.query).toHaveBeenCalledWith(
                'DELETE FROM volunteer_skills WHERE Volunteer_id = ?',
                [1]
            );
        });

        test('should return 0 affected rows if volunteer has no skills', async () => {
            mockConnection.query.mockResolvedValue([{ affectedRows: 0 }]);
            
            const result = await VolunteerSkillsModelDB.deleteAllVolunteerSkills(999);
            
            expect(result.affectedRows).toBe(0);
        });

        test('should throw error if database delete fails', async () => {
            mockConnection.query.mockRejectedValue(new Error('Delete failed'));
            
            await expect(VolunteerSkillsModelDB.deleteAllVolunteerSkills(1))
                .rejects.toThrow('Delete failed');
        });
    });
});