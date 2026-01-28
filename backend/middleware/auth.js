import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Generate JWT Token
 * @param {string} userId - User's MongoDB ID
 * @returns {string} - JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Protect routes - Verify JWT token
 * Middleware to check if user is authenticated
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (format: "Bearer TOKEN")
      token = req.headers.authorization.split(' ')[1];

      console.log('🔐 Token verification:', {
        hasToken: !!token,
        tokenStart: token ? token.substring(0, 10) + '...' : 'none',
      });

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log('✅ Token decoded successfully:', { userId: decoded.id });

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.warn('❌ User not found for ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      if (!req.user.isActive) {
        console.warn('❌ User account is deactivated:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated',
        });
      }

      console.log('✅ Auth successful for user:', req.user._id);
      next();
    } catch (error) {
      console.error('❌ Token verification error:', {
        message: error.message,
        name: error.name,
        JWT_SECRET_SET: !!process.env.JWT_SECRET,
      });
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired, please login again',
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid token',
      });
    }
  }

  if (!token) {
    console.warn('❌ No authorization token provided');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

/**
 * Authorize specific roles
 * @param  {...string} roles - Allowed roles
 * @returns {Function} - Middleware function
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

/**
 * Optional authentication - doesn't block if no token
 * Useful for routes that work differently for authenticated vs non-authenticated users
 */
export const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token is invalid, but we don't block the request
      req.user = null;
    }
  }

  next();
};
