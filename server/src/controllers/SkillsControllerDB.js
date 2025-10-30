const VolunteerSkillsDB = require('../models/VolunteerSkillsModelDB');
const SkillsDB = require('../models/SkillsModelDB');

// ============================================
// SKILLS ENDPOINTS (for /api/skills/db)
// ============================================

// GET all skills from database
const getAllSkillsDB = async (req, res) => {
    try {
        const skills = await SkillsDB.getAllSkills();
        
        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            count: skills.length,
            data: skills
        });
    } catch (error) {
        console.error('Error in getAllSkillsDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve skills from database',
            error: error.message
        });
    }
};

// GET skill by ID from database
const getSkillByIdDB = async (req, res) => {
    try {
        const skill = await SkillsDB.getSkillById(req.params.id);
        
        if (!skill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found in database'
            });
        }
        
        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            data: skill
        });
    } catch (error) {
        console.error('Error in getSkillByIdDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve skill from database',
            error: error.message
        });
    }
};


// ============================================
// VOLUNTEER SKILLS ENDPOINTS (for /api/volunteers/db/:id/skills)
// ============================================


// GET volunteer skills with full details (JOIN query)
const getVolunteerSkillsDB = async (req, res) => {
    try {
        const skills = await VolunteerSkillsDB.getVolunteerSkillsWithDetails(req.params.id);
        
        res.status(200).json({
            success: true,
            source: 'Azure MySQL Database',
            volunteer_id: req.params.id,
            count: skills.length,
            data: skills
        });
    } catch (error) {
        console.error('Error in getVolunteerSkillsDB:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve volunteer skills from database',
            error: error.message
        });
    }
};

module.exports = {
    // Skills endpoints
    getAllSkillsDB,
    getSkillByIdDB,

    // Volunteer skills endpoints
    getVolunteerSkillsDB
};