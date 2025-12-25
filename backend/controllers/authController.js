const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET || 'yumblock_secret_key_2024';
const JWT_EXPIRE = '30d'; // Token valid for 30 days

/**
 * Login user/merchant
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email });

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // DEMO LOGIN - Replace with database check in production
    // Merchant credentials
    if (email === 'merchant@yumblock.com' && password === 'merchant123') {
      
      // Create JWT token with proper payload
      const token = jwt.sign(
        {
          userId: 'merchant_001',
          email: email,
          role: 'merchant'
        },
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRE
        }
      );

      console.log('Merchant login successful');
      console.log('🔑 Token generated:', token.substring(0, 50) + '...');

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: 'merchant_001',
          email: email,
          role: 'merchant',
          name: 'YumBlock Merchant'
        }
      });
    }

    // Customer credentials (for testing)
    if (email === 'customer@test.com' && password === 'customer123') {
      
      const token = jwt.sign(
        {
          userId: 'customer_001',
          email: email,
          role: 'customer'
        },
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRE
        }
      );

      console.log('Customer login successful');

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: 'customer_001',
          email: email,
          role: 'customer',
          name: 'Test Customer'
        }
      });
    }

    // Invalid credentials
    console.log('Invalid credentials');
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed: ' + error.message
    });
  }
};

/**
 * Get current user info
 */
exports.getMe = async (req, res) => {
  try {
    // req.user is set by auth middleware
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Logout (frontend handles token removal)
 */
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};