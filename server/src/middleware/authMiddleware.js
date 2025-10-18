const admin = require('../config/firebase-admin');

/**
 * Middleware to verify Firebase ID token
 * Attaches user info to req.user if token is valid
 */
exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No token provided. Authorization header must be in format: Bearer <token>'
      });
    }

    // Extract token
    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid token format'
      });
    }

    // Verify token with Firebase Admin
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Attach user info to request
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      };

      next();
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError.message);
      
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired token',
        details: verifyError.message
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Error during authentication'
    });
  }
};


exports.requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
      }

      // Get user role from mock database (not actual db)
      const authController = require('../controllers/authController');
      const users = authController.getMockUsers();
      const userData = users.get(req.user.uid);

      if (!userData) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'User profile not found'
        });
      }

      // Check if user has required role
      if (!allowedRoles.includes(userData.role)) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
          userRole: userData.role
        });
      }

      // Attach role to request for use in controllers
      req.user.role = userData.role;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Error during role verification'
      });
    }
  };
};

/**
 * Middleware to check if user is admin
 */
exports.requireAdmin = exports.requireRole(['admin']);

/**
 * Middleware to check if user is employee or admin
 */
exports.requireEmployeeOrAdmin = exports.requireRole(['employee', 'admin']);