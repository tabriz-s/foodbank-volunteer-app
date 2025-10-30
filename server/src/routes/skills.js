// routes pertaining to skills
const express = require('express');
const router = express.Router();
const {getAllSkills} = require('../controllers/SkillsController'); // mock data import
const SkillsControllerDB = require('../controllers/SkillsControllerDB'); // database import

// mock routes 
// (GETS)
// /api/skills - Get all available skills
router.get('/', getAllSkills);


//=================================================

// REAL routes - Azure MySQL

// GET /api/skills/db - Get all skills from database
router.get('/db', SkillsControllerDB.getAllSkillsDB);

// GET /api/skills/db/:id - Get single skill by ID from database
router.get('/db/:id', SkillsControllerDB.getSkillByIdDB);

module.exports = router;