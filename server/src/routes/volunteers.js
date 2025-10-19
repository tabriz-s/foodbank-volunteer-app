const express = require('express');
const router = express.Router();
const { validateProfile } = require('../middleware/VolunteerMiddleware');
const {
  getProfile,
  createProfile,
  updateProfile,
  getAllVolunteers,
  deleteVolunteer
} = require('../controllers/ProfileController');
const SkillsDB = require('../models/SkillsModelDB');

// =====hardcoaded routes=====
//====================================
// GET /api/volunteers - Get all volunteers (admin only)
router.get('/', getAllVolunteers);

// GET /api/volunteers/profile
router.get('/profile', getProfile);

// POST /api/volunteers/profile
router.post('/profile', validateProfile, createProfile);

// PUT /api/volunteers/profile
router.put('/profile', validateProfile, updateProfile);

// DELETE /api/volunteers/:id
router.delete('/:id', deleteVolunteer);
//===============================================

module.exports = router;