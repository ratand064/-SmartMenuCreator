const jwt = require('jsonwebtoken');

// JWT Secret - MUST match what you use in login
const JWT_SECRET = process.env.JWT_SECRET || 'yumblock_secret_key_2024';

/**
 * Protect middleware - Verify JWT token
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found in header');
    }

    //If no token found
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        success: false,
        error: 'Not authorized. Please login.',
        code: 'NO_TOKEN'
      });
    }

    try {
      //Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      console.log('Token verified:', {
        userId: decoded.userId || decoded.id,
        email: decoded.email,
        role: decoded.role
      });

      //Attach user info to request
      req.user = {
        userId: decoded.userId || decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      next();

    } catch (err) {
      console.error('Token verification failed:', err.message);
      
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Session expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      }

      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token. Please login again.',
          code: 'INVALID_TOKEN'
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        code: 'AUTH_FAILED'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server authentication error'
    });
  }
};

/**
 * Merchant only middleware
 */
exports.merchantOnly = (req, res, next) => {
  if (!req.user) {
    console.log('No user in request');
    return res.status(401).json({
      success: false,
      error: 'Not authenticated'
    });
  }

  if (req.user.role !== 'merchant') {
    console.log('Access denied. User role:', req.user.role);
    return res.status(403).json({
      success: false,
      error: 'Access denied. Merchant only.',
      userRole: req.user.role
    });
  }

  console.log('Merchant access granted');
  next();
};