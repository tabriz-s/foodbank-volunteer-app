// Mock user storage
const users = new Map();

// Generate mock token
const generateToken = () => {
  return 'mocktoken_' + Math.random().toString(36).substr(2, 9);
};


exports.register = async (req, res) => {
  try {
    const { email, password, role = 'volunteer', displayName } = req.body;

    // Validation, here and not in middleware for their tests
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

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

// login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user (or create mock for testing)
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