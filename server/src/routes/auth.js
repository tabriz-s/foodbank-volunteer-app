const express = require('express');
const router = express.Router();
const { mockAuth } = require('../middleware/AuthMiddleware');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    // TODO: Implement user registration with Firebase
    res.status(200).json({ message: 'Registration endpoint - coming soon' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    // TODO: Implement user login with Firebase
    res.status(200).json({ message: 'Login endpoint - coming soon' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//GET /api/auth/me
// Returns the currently authenticated mock user
router.get('/me', mockAuth, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
});

module.exports = router;