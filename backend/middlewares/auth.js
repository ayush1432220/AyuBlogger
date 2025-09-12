import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import ErrorHandler from './error.js';
import { AsyncError } from './AsyncError.js';

// Authentication middleware - verifies JWT token
export const isAuthenticated = AsyncError(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorHandler('Access denied. No token provided', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new ErrorHandler('Invalid token. User not found', 401));
    }

    if (user.status === 'inactive' || user.status === 'banned') {
      return next(new ErrorHandler('Account is deactivated. Please contact support', 403));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ErrorHandler('Invalid token', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(new ErrorHandler('Token expired. Please login again', 401));
    } else {
      return next(new ErrorHandler('Authentication failed', 500));
    }
  }
});

// Optional authentication - doesn't fail if no token is provided
export const optionalAuth = AsyncError(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Check for token in cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database and attach to request
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.status !== 'inactive' && user.status !== 'banned') {
        req.user = user;
      }
    } catch (error) {
      // If token is invalid, just continue without user
      // Don't throw an error for optional auth
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
});

// Authorization middleware - checks user roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler('Access denied. Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler('Access denied. Insufficient permissions', 403));
    }

    next();
  };
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler('Access denied. Authentication required', 401));
  }

  if (req.user.role !== 'admin') {
    return next(new ErrorHandler('Access denied. Admin privileges required', 403));
  }

  next();
};

// Rate limiting middleware (more sophisticated version)
const requestCounts = new Map();

export const rateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100, skipSuccessfulRequests = false) => {
  return (req, res, next) => {
    const identifier = req.user ? req.user._id.toString() : req.ip;
    const now = Date.now();
    
    if (!requestCounts.has(identifier)) {
      requestCounts.set(identifier, []);
    }
    
    const requests = requestCounts.get(identifier);
    
    // Remove expired requests
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return next(new ErrorHandler('Too many requests. Please try again later', 429));
    }
    
    validRequests.push(now);
    requestCounts.set(identifier, validRequests);
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - validRequests.length));
    res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
    
    next();
  };
};

// IP-based rate limiting for public endpoints
export const ipRateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return rateLimit(windowMs, maxRequests, true);
};

// Validate API key for external API access (optional)
export const validateApiKey = (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  
  if (!apiKey) {
    return next(new ErrorHandler('API key required', 401));
  }
  
  // Here you would validate against your API keys database
  // For now, just check against environment variable
  if (apiKey !== process.env.API_KEY) {
    return next(new ErrorHandler('Invalid API key', 401));
  }
  
  next();
};