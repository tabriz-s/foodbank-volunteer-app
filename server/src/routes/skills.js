// routes pertaining to skills
const express = require('express');
const router = express.Router();
const {getAllSkills} = require('../controllers/SkillsController');
const SkillsDB = require('../models/SkillsModelDB');

// mock routes =====================================
// (GETS)
// /api/skills - Get all available skills
router.get('/', getAllSkills);
//=================================================

// REAL routes - Azure MySQL

//GETS
//api/skills/db
router.get('/db', async (req, res) => {
    try {
        const skills = await SkillsDB.getAllSkills();

        res.status(200).json({
            success: true, 
            source: 'Azure MySQL Database',
            data: skills
        });

    } catch (error) {
        console.error('Error in /db endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve skills from database',
            error: error.message
        });
    }
});

// GET /api/skills/db/:id - get skills by ID
router.get('/db/:id', async (req, res) => {
    try {
        const skill = await SkillsDB.getSkillById(req.params.id);

        // skill doesnt exist error
        if (!skill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found in database'
            });
        }

        res.status(200).json({
            sucess: true, 
            source: 'Azure MySQL Database',
            data: skill
        });
    } catch (error) {
        console.error('Error in /db/:id endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve skill from database',
            error: error.message
        });
    }
});

module.exports = router;