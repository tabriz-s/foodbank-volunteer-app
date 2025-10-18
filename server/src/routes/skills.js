// routes pertaining to skills
const express = require('express');
const router = express.Router();
const {getAllSkills} = require('../controllers/SkillsController');

// (GETS)
// /api/skills - Get all available skills
router.get('/', getAllSkills);

module.exports = router;