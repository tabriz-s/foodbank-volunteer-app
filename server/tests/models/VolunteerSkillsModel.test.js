//Test for volunteer and skill joint data models

const VolunteerSkills = require('../../src/models/VolunteerSkillsModel');

describe('VolunteerSkillsModel', () => {
    
    // Mock the internal data array to avoid affecting actual model
    let mockVolunteerSkills;
    
    beforeEach(() => {
        // Create fresh mock data before each test
        mockVolunteerSkills = [
            { Volunteer_id: 1, Skills_id: 1, Experience_level: 'intermediate', Date_acquired: '2023-01-15' },
            { Volunteer_id: 1, Skills_id: 3, Experience_level: 'beginner', Date_acquired: '2023-03-20' },
            { Volunteer_id: 1, Skills_id: 7, Experience_level: 'intermediate', Date_acquired: '2022-11-10' },
            { Volunteer_id: 2, Skills_id: 5, Experience_level: 'expert', Date_acquired: '2022-06-10' },
            { Volunteer_id: 2, Skills_id: 6, Experience_level: 'expert', Date_acquired: '2022-06-10' },
            { Volunteer_id: 2, Skills_id: 9, Experience_level: 'intermediate', Date_acquired: '2023-08-15' }
        ];
    });

    describe('getVolunteerSkills', () => {
        test('should return array of skills for volunteer 1', () => {
            const skills = VolunteerSkills.getVolunteerSkills(1);
            expect(Array.isArray(skills)).toBe(true);
            expect(skills.length).toBeGreaterThanOrEqual(3); // At least 3 originally
        });

        test('should return array of skills for volunteer 2', () => {
            const skills = VolunteerSkills.getVolunteerSkills(2);
            expect(skills.length).toBeGreaterThanOrEqual(3);
        });

        test('should return empty array for non-existent volunteer', () => {
            const skills = VolunteerSkills.getVolunteerSkills(999);
            expect(skills).toHaveLength(0);
        });

        test('should handle string volunteer ID', () => {
            const skills = VolunteerSkills.getVolunteerSkills('1');
            expect(skills.length).toBeGreaterThanOrEqual(3);
        });

        test('returned skills should have correct structure', () => {
            const skills = VolunteerSkills.getVolunteerSkills(1);
            if (skills.length > 0) {
                skills.forEach(skill => {
                    expect(skill).toHaveProperty('Volunteer_id');
                    expect(skill).toHaveProperty('Skills_id');
                    expect(skill).toHaveProperty('Experience_level');
                    expect(skill).toHaveProperty('Date_acquired');
                });
            }
        });
    });

    describe('getVolunteerSkillsWithDetails', () => {
        test('should return skills with full details (JOIN)', () => {
            const skills = VolunteerSkills.getVolunteerSkillsWithDetails(1);
            expect(skills.length).toBeGreaterThanOrEqual(1);
            
            // Check first skill has joined data
            if (skills.length > 0) {
                expect(skills[0]).toHaveProperty('Description');
                expect(skills[0]).toHaveProperty('Category');
                expect(skills[0]).toHaveProperty('Experience_level');
                expect(skills[0]).toHaveProperty('Date_acquired');
            }
        });

        test('should return array for volunteer with skills', () => {
            const skills = VolunteerSkills.getVolunteerSkillsWithDetails(1);
            expect(Array.isArray(skills)).toBe(true);
        });

        test('should return empty array for non-existent volunteer', () => {
            const skills = VolunteerSkills.getVolunteerSkillsWithDetails(999);
            expect(skills).toHaveLength(0);
        });
    });

    describe('addVolunteerSkill', () => {
        test('should add a new skill to a volunteer', () => {
            const newSkill = VolunteerSkills.addVolunteerSkill(3, 2, 'beginner', '2024-01-01');
            
            expect(newSkill).toHaveProperty('Volunteer_id', 3);
            expect(newSkill).toHaveProperty('Skills_id', 2);
            expect(newSkill).toHaveProperty('Experience_level', 'beginner');
            expect(newSkill).toHaveProperty('Date_acquired', '2024-01-01');
        });

        test('should convert IDs to integers', () => {
            const newSkill = VolunteerSkills.addVolunteerSkill('3', '4', 'intermediate', '2024-01-01');
            
            expect(newSkill.Volunteer_id).toBe(3);
            expect(newSkill.Skills_id).toBe(4);
            expect(typeof newSkill.Volunteer_id).toBe('number');
            expect(typeof newSkill.Skills_id).toBe('number');
        });

        test('should increase skills count after adding', () => {
            const beforeCount = VolunteerSkills.getVolunteerSkills(3).length;
            VolunteerSkills.addVolunteerSkill(3, 2, 'expert', '2024-01-01');
            const afterCount = VolunteerSkills.getVolunteerSkills(3).length;
            
            expect(afterCount).toBe(beforeCount + 1);
        });
    });

    describe('deleteVolunteerSkill', () => {
        test('should delete an existing skill', () => {
            // Add a test skill first
            VolunteerSkills.addVolunteerSkill(3, 1, 'beginner', '2024-01-01');
            const beforeCount = VolunteerSkills.getVolunteerSkills(3).length;
            
            const result = VolunteerSkills.deleteVolunteerSkill(3, 1);
            expect(result).toBe(true);
            
            const afterCount = VolunteerSkills.getVolunteerSkills(3).length;
            expect(afterCount).toBe(beforeCount - 1);
        });

        test('should return false for non-existent skill', () => {
            const result = VolunteerSkills.deleteVolunteerSkill(1, 999);
            expect(result).toBe(false);
        });

        test('should return false for non-existent volunteer', () => {
            const result = VolunteerSkills.deleteVolunteerSkill(999, 1);
            expect(result).toBe(false);
        });

        test('deleted skill should not appear in getVolunteerSkills', () => {
            VolunteerSkills.addVolunteerSkill(3, 8, 'beginner', '2024-01-01');
            VolunteerSkills.deleteVolunteerSkill(3, 8);
            const skills = VolunteerSkills.getVolunteerSkills(3);
            
            const hasDeletedSkill = skills.some(s => s.Skills_id === 8);
            expect(hasDeletedSkill).toBe(false);
        });
    });

    describe('deleteAllVolunteerSkills', () => {
        test('should delete all skills for a volunteer', () => {
            // Add some skills first
            VolunteerSkills.addVolunteerSkill(3, 1, 'beginner', '2024-01-01');
            VolunteerSkills.addVolunteerSkill(3, 2, 'intermediate', '2024-01-01');
            
            const result = VolunteerSkills.deleteAllVolunteerSkills(3);
            expect(result).toBe(true);
            
            const skills = VolunteerSkills.getVolunteerSkills(3);
            expect(skills).toHaveLength(0);
        });

        test('should return true even for non-existent volunteer', () => {
            const result = VolunteerSkills.deleteAllVolunteerSkills(999);
            expect(result).toBe(true);
        });
    });

    describe('replaceVolunteerSkills', () => {
        test('should replace all skills for a volunteer', () => {
            const newSkills = [
                { Skills_id: 2, Experience_level: 'beginner', Date_acquired: '2024-01-01' },
                { Skills_id: 4, Experience_level: 'intermediate', Date_acquired: '2024-01-02' }
            ];
            
            const result = VolunteerSkills.replaceVolunteerSkills(3, newSkills);
            expect(result).toHaveLength(2);
            expect(result[0].Skills_id).toBe(2);
            expect(result[1].Skills_id).toBe(4);
        });

        test('should work with empty array (remove all)', () => {
            VolunteerSkills.replaceVolunteerSkills(3, []);
            const skills = VolunteerSkills.getVolunteerSkills(3);
            expect(skills).toHaveLength(0);
        });

        test('should completely replace old skills', () => {
            // Add some skills
            VolunteerSkills.addVolunteerSkill(3, 1, 'beginner', '2024-01-01');
            VolunteerSkills.addVolunteerSkill(3, 3, 'intermediate', '2024-01-01');
            
            // Replace with new skills
            const newSkills = [
                { Skills_id: 5, Experience_level: 'expert', Date_acquired: '2024-02-01' }
            ];
            
            VolunteerSkills.replaceVolunteerSkills(3, newSkills);
            const skills = VolunteerSkills.getVolunteerSkills(3);
            
            // Should only have the new skill
            expect(skills).toHaveLength(1);
            expect(skills[0].Skills_id).toBe(5);
        });
    });

    describe('hasSkill', () => {
        test('should return true when volunteer has skill', () => {
            // Add test skills
            VolunteerSkills.addVolunteerSkill(3, 1, 'beginner', '2024-01-01');
            VolunteerSkills.addVolunteerSkill(3, 3, 'intermediate', '2024-01-01');
            
            expect(VolunteerSkills.hasSkill(3, 1)).toBe(true);
            expect(VolunteerSkills.hasSkill(3, 3)).toBe(true);
        });

        test('should return false when volunteer does not have skill', () => {
            expect(VolunteerSkills.hasSkill(3, 999)).toBe(false);
        });

        test('should return false for non-existent volunteer', () => {
            expect(VolunteerSkills.hasSkill(999, 1)).toBe(false);
        });

        test('should handle string IDs', () => {
            VolunteerSkills.addVolunteerSkill(3, 5, 'beginner', '2024-01-01');
            expect(VolunteerSkills.hasSkill('3', '5')).toBe(true);
            expect(VolunteerSkills.hasSkill('3', '999')).toBe(false);
        });
    });
    
});