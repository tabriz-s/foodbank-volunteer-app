const admin = require('../config/firebase-admin');

// Mock user database (replace with actual database later)
const users = new Map();

/**
 * Register a new user
 * @route POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { uid, email, role, displayName } = req.body;

    // Validate required fields
    if (!uid || !email || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: uid, email, and role are required'
      });
    }

    // Validate role
    const validRoles = ['volunteer', 'employee', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be one of: volunteer, employee, admin'
      });
    }

    // Check if user already exists
    if (users.has(uid)) {
      return res.status(409).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Create user record (this would go to the DB)
    const userData = {
      uid,
      email,
      role,
      displayName: displayName || email.split('@')[0],
      profileCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.set(uid, userData);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        uid: userData.uid,
        email: userData.email,
        role: userData.role,
        displayName: userData.displayName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration',
      message: error.message
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { uid, email, idToken } = req.body;

    // Validate required fields
    if (!uid || !idToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: uid and idToken are required'
      });
    }

    // Verify Firebase ID token
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      if (decodedToken.uid !== uid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        message: tokenError.message
      });
    }

    // Get user data (from mock data)
    let userData = users.get(uid);

    // If user doesn't exist, create a basic entry
    if (!userData) {
      userData = {
        uid,
        email: email || 'unknown@example.com',
        role: 'volunteer', // default role
        displayName: email ? email.split('@')[0] : 'User',
        profileCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users.set(uid, userData);
    }

    // Update last login
    userData.lastLogin = new Date().toISOString();
    users.set(uid, userData);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        uid: userData.uid,
        email: userData.email,
        role: userData.role,
        displayName: userData.displayName,
        profileCompleted: userData.profileCompleted
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login',
      message: error.message
    });
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    // In final app implement this:
    // 1. Revoke the Firebase token
    // 2. Clear any server-side sessions
    // 3. Update last logout time in database

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during logout',
      message: error.message
    });
  }
};

/**
 * Verify user token
 * @route POST /api/auth/verify
 */
exports.verifyUser = async (req, res) => {
  try {
    // Token is already verified by middleware
    // req.user contains the decoded token
    
    const userData = users.get(req.user.uid);

    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        uid: userData.uid,
        email: userData.email,
        role: userData.role,
        displayName: userData.displayName
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during verification',
      message: error.message
    });
  }
};

/**
 * Get current user info
 * @route GET /api/auth/me
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const userData = users.get(req.user.uid);

    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

/**
 * Refresh authentication token
 * @route POST /api/auth/refresh
 */
exports.refreshToken = async (req, res) => {
  try {
    // In final implementation, generate a new token
    // For now, verify if the existing token is valid
    
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during token refresh',
      message: error.message
    });
  }
};

// Export mock users for testing
exports.getMockUsers = () => users;
exports.clearMockUsers = () => users.clear();