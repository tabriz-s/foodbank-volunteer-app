// handle requests for skills.
const Skills = require('../models/SkillsModel')

// GET all available skills
const getAllSkills = async (req, res) => {
    try {
        const skills = Skills.getAllSkills();

        res.status(200).json({
            success: true,
            count: skills.length,
            data: skills
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    getAllSkills
};