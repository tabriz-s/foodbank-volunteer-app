const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * 
 * No validation middleware, validation happens in controller
 * 
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', verifyToken, authController.logout);

/**
 * @route   POST /api/auth/verify
 * @desc    Verify user token
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

module.exports = router;