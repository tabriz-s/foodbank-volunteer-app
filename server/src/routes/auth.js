const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { verifyToken } = require('../middleware/authMiddleware');
const { mockAuth } = require('../middleware/AuthMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegistration, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and create session
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and clear session
 * @access  Private
 */
router.post('/logout', verifyToken, authController.logout);

/**
 * @route   POST /api/auth/verify
 * @desc    Verify Firebase ID token
 * @access  Private
 */
router.post('/verify', verifyToken, authController.verifyUser);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', verifyToken, authController.getCurrentUser);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh authentication token
 * @access  Private
 */
router.post('/refresh', verifyToken, authController.refreshToken);

//GET /api/auth/me
// Returns the currently authenticated mock user
router.get('/me', mockAuth, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
});

module.exports = router;