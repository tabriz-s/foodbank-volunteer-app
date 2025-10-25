const express = require('express');
const router = express.Router();
const { validateProfile, validateProfileUpdate } = require('../middleware/VolunteerMiddleware');

// mock data controllers
const {
  getProfile,
  createProfile,
  updateProfile,
  getAllVolunteers,
  deleteVolunteer
} = require('../controllers/ProfileController');

// Database controllers
const {
  getAllVolunteersDB,
  getProfileDB,
  getVolunteerByIdDB,
  createProfileDB,
  updateProfileDB
} = require('../controllers/ProfileControllerDB');
const {
  getVolunteerSkillsDB
} = require('../controllers/SkillsControllerDB');

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


// REAL routes - Azure MySQL

// GET /api/volunteers/db - Get all volunteers from database
router.get('/db', getAllVolunteersDB);

// GET /api/volunteers/db/profile - Get profile by user_id from database
router.get('/db/profile', getProfileDB);

// GET /api/volunteers/db/:id - Get volunteer by ID from database
router.get('/db/:id', getVolunteerByIdDB);

// GET /api/volunteers/db/:id/skills - Get volunteer skills with details from database
router.get('/db/:id/skills', getVolunteerSkillsDB);

// POST /api/volunteers/db/profile - Create new profile in database
router.post('/db/profile', validateProfile, createProfileDB);

// PUT /api/volunteers/db/profile - Update profile in database
router.put('/db/profile', validateProfileUpdate, updateProfileDB);

module.exports = router;