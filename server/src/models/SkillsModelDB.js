const { getConnection } = require('../config/database');

// get all skills from database
const getAllSkills = async () => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM SKILLS ORDER BY Category, Description'
        );
        return rows;

    } catch (error) {
        console.error('Error getting all skills:', error);
        throw error;
    }
};

// Get skill by ID
const getSkillById = async (skillId) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM SKILLS WHERE Skills_id = ?',
            [skillId]
        );
        return rows[0];
    } catch (error) {
        console.error('Error getting skill by ID:', error);
        throw error;
    }
};

// Check if skill exists
const skillExists = async (skillId) => {
    try {
        const skill = await getSkillById(skillId);
        return !!skill;
    } catch (error) {
        console.error('Error checking skill existence:', error);
        return false;
    }
};

module.exports = {
    getAllSkills,
    getSkillById,
    skillExists
};