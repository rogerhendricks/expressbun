import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import prisma from '../utils/prisma.js'; // Assuming you have a centralized Prisma instance

/**
 * Authentication middleware to protect routes
 * Verifies JWT tokens and attaches user data to request object
 */
const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = await verifyToken(token);
    const user = await fetchUser(decoded.userId);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. User not found.'
      });
    }

    // Attach user to request object
    req.user = user;
    next();

  } catch (error) {
    handleAuthError(error, res);
  }
});

/**
 * Extract token from request
 * Checks multiple sources in order of preference
 */
const extractToken = (req) => {
  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  // Then check cookies
  return req.cookies.accessToken || req.cookies.jwt;
};

/**
 * Verify JWT token
 * @returns {Promise} Decoded token payload
 */
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, {
      algorithms: ['HS256'], // Explicitly specify allowed algorithms
      maxAge: '15m'         // Maximum age of token
    }, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  });
};

/**
 * Fetch user from database
 * Excludes sensitive fields and includes only necessary data
 */
const fetchUser = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      // role: true,      // If you have role-based authentication
      // isActive: true,  // If you track user account status
    }
  });
};

/**
 * Handle authentication errors
 * Provides specific error messages based on error type
 */
const handleAuthError = (error, res) => {
  const errors = {
    TokenExpiredError: {
      status: 401,
      message: 'Session expired. Please log in again.'
    },
    JsonWebTokenError: {
      status: 401,
      message: 'Invalid token. Please log in again.'
    },
    NotBeforeError: {
      status: 401,
      message: 'Token not yet active. Please try again.'
    }
  };

  const errorResponse = errors[error.name] || {
    status: 500,
    message: 'Authentication error occurred.'
  };

  // Log error for debugging (consider using a proper logging solution)
  console.error('Auth Error:', {
    name: error.name,
    message: error.message,
    timestamp: new Date().toISOString()
  });

  return res.status(errorResponse.status).json({
    status: 'error',
    message: errorResponse.message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Optional: Middleware for role-based access control
 * Usage: router.get('/admin', protect, requireRole('admin'), adminController)
 */
// const requireRole = (role) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({
//         status: 'error',
//         message: 'Authentication required'
//       });
//     }

//     if (req.user.role !== role) {
//       return res.status(403).json({
//         status: 'error',
//         message: 'Access denied. Insufficient permissions.'
//       });
//     }

//     next();
//   };
// };

export { protect };