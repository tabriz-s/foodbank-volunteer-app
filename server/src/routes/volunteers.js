const express = require('express');
const router = express.Router();
const { validateProfile } = require('../middleware/Validation');
const {
  getProfile,
  createProfile,
  updateProfile,
  getAllVolunteers,
  deleteVolunteer
} = require('../controllers/ProfileController');

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

module.exports = router;

/*
// GET /api/volunteers - Get all volunteers (admin only)
router.get('/', async (req, res) => {
  try {
    res.status(200).json({ message: 'Get volunteers endpoint - coming soon' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/volunteers/profile - Get volunteer profile
router.get('/profile', async (req, res) => {
  try {
    res.status(200).json({ message: 'Get volunteer profile endpoint - coming soon' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/volunteers/profile - Update volunteer profile
router.put('/profile', async (req, res) => {
  try {
    res.status(200).json({ message: 'Update volunteer profile endpoint - coming soon' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/
