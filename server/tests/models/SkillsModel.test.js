const Skills = require('../../src/models/SkillsModel');

describe('SkillsModel', () => {

    describe('getAllSkills', () => {
        test('should return an array', () => {
            const skills = Skills.getAllSkills();
            expect(Array.isArray(skills)).toBe(true);
        });

        test('should return all 9 skills', () => {
            const skills = Skills.getAllSkills();
            expect(skills).toHaveLength(9);
        });

        test('each skill should have Skills_id, Description, and Category', () => {
            const skills = Skills.getAllSkills();
            skills.forEach(skill => {
                expect(skill).toHaveProperty('Skills_id');
                expect(skill).toHaveProperty('Description');
                expect(skill).toHaveProperty('Category');
            });
        });

        test('Skills_id should be a number', () => {
            const skills = Skills.getAllSkills();
            skills.forEach(skill => {
                expect(typeof skill.Skills_id).toBe('number');
            });
        });

        test('Description should be a string', () => {
            const skills = Skills.getAllSkills();
            skills.forEach(skill => {
                expect(typeof skill.Description).toBe('string');
            });
        });

        test('Category should be a string', () => {
            const skills = Skills.getAllSkills();
            skills.forEach(skill => {
                expect(typeof skill.Category).toBe('string');
            });
        });
    });

    describe('getSkillById', () => {

        test('should return correct skill for valid ID', () => {
            const skill = Skills.getSkillById(1);
            expect(skill).toBeDefined();
            expect(skill.Skills_id).toBe(1);
            expect(skill.Description).toBe('Cooking');
            expect(skill.Category).toBe('Food_Preparation');
        });

        test('should return correct skill for ID 5', () => {
            const skill = Skills.getSkillById(5);
            expect(skill).toBeDefined();
            expect(skill.Skills_id).toBe(5);
            expect(skill.Description).toBe('CDL License');
            expect(skill.Category).toBe('Transportation');
        });

        test('should return undefined for non-existent ID', () => {
            const skill = Skills.getSkillById(999);
            expect(skill).toBeUndefined();
        });

        test('should return undefined for ID 0', () => {
            const skill = Skills.getSkillById(0);
            expect(skill).toBeUndefined();
        });

        test('should handle string ID by converting to number', () => {
            const skill = Skills.getSkillById('3');
            expect(skill).toBeDefined();
            expect(skill.Skills_id).toBe(3);
        });
    });

    describe('skillExists', () => {

        test('should return true for existing skill ID', () => {
            expect(Skills.skillExists(1)).toBe(true);
            expect(Skills.skillExists(5)).toBe(true);
            expect(Skills.skillExists(9)).toBe(true);
        });

        test('should return false for non-existent skill ID', () => {
            expect(Skills.skillExists(999)).toBe(false);
            expect(Skills.skillExists(0)).toBe(false);
            expect(Skills.skillExists(-1)).toBe(false);
        });

        test('should handle string ID', () => {
            expect(Skills.skillExists('1')).toBe(true);
            expect(Skills.skillExists('999')).toBe(false);
        });
    });

    
});