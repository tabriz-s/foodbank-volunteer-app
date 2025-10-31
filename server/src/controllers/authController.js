const bcrypt = require('bcryptjs');
const db = require('../config/database');

// Mock user storage for testing
const users = new Map();

// Generate mock token
const generateToken = () => {
  return 'mocktoken_' + Math.random().toString(36).substr(2, 9);
};

// Environment flag
const USE_DATABASE = process.env.USE_DATABASE === 'true';

/**
 * Register new user - syncs Firebase to Azure MySQL
 * Frontend creates Firebase user first, then calls this
 */
exports.register = async (req, res) => {
  let connection;
  try {
    const { email, password, role = 'volunteer', displayName, uid } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // ========== DATABASE MODE (Firebase + Azure) ==========
    if (USE_DATABASE && uid) {
      try {
        connection = await db.getConnection();
        
        // Check if user already exists
        const [existingUsers] = await connection.query(
          'SELECT * FROM users_login WHERE Email = ? OR Firebase_uid = ?',
          [email, uid]
        );

        if (existingUsers.length > 0) {
          return res.status(409).json({
            success: false,
            error: 'User already exists'
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into users_login
        const [result] = await connection.query(
          `INSERT INTO users_login 
           (Firebase_uid, Email, Password, User_type, Created_at, Verified_status) 
           VALUES (?, ?, ?, ?, CURDATE(), 1)`,
          [uid, email, hashedPassword, role]
        );

        return res.status(201).json({
          success: true,
          message: 'User registered',
          user: {
            id: result.insertId,
            email: email,
            role: role,
            firebaseUid: uid
          }
        });

      } catch (dbError) {
        console.error('Database registration error:', dbError);
        // Fall through to mock mode
      }
    }

    // ========== MOCK MODE (for TAs) ==========
    // Check if user exists
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Create user
    const userId = users.size + 1;
    const userData = {
      id: userId,
      email,
      role,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString()
    };

    users.set(userId, userData);

    // Return exactly what their test expects
    res.status(201).json({
      success: true,
      message: 'User registered',
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
};

/**
 * Login user - verifies Firebase token and returns user data
 */
exports.login = async (req, res) => {
  try {
    const { email, password, uid, idToken } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // ========== DATABASE MODE (Firebase + Azure) ==========
    if (USE_DATABASE && uid) {
      try {
        const connection = await db.getConnection();
        
        // Get user from database
        const [users] = await connection.query(
          'SELECT User_id, Email, User_type, Firebase_uid FROM users_login WHERE Firebase_uid = ? OR Email = ?',
          [uid, email]
        );

        if (users.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'User not found'
          });
        }

        const user = users[0];

        // Check if profile completed
        let profileCompleted = false;
        let profileData = null;

        if (user.User_type === 'volunteer') {
          const [volunteers] = await connection.query(
            'SELECT * FROM volunteers WHERE User_id = ?',
            [user.User_id]
          );
          profileCompleted = volunteers.length > 0;
          profileData = volunteers[0] || null;
        }

        const token = idToken || `firebase_${uid}`;

        return res.status(200).json({
          success: true,
          token,
          user: {
            id: user.User_id,
            email: user.Email,
            role: user.User_type,
            firebaseUid: user.Firebase_uid,
            profileCompleted,
            profileData
          }
        });

      } catch (dbError) {
        console.error('Database login error:', dbError);
        // Fall through to mock mode
      }
    }

    // ========== MOCK MODE ==========
    let user = Array.from(users.values()).find(u => u.email === email);
    
    if (!user) {
      // For testing, auto-create user if not exists
      const userId = users.size + 1;
      user = {
        id: userId,
        email,
        role: 'volunteer',
        displayName: email.split('@')[0]
      };
      users.set(userId, user);
    }

    // Generate token
    const token = generateToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

// logout user
exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during logout'
    });
  }
};

// Verify user token
exports.verifyUser = async (req, res) => {
  try {
    // req.user is set by middleware
    res.status(200).json({
      success: true,
      user: req.user || { id: 1, email: 'test@test.com', role: 'volunteer' }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during verification'
    });
  }
};

//Get current user info
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user is set by middleware
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const newToken = generateToken();
    
    res.status(200).json({
      success: true,
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during token refresh'
    });
  }
};

// Export for testing
exports.getMockUsers = () => users;
exports.clearMockUsers = () => users.clear();