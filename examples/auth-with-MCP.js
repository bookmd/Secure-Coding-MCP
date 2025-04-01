const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// User model - in a real app, this would be imported from your models directory
const User = require('../models/User');

// Environment variables - in production, use proper env configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

// Rate limiting middleware to prevent brute force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per window
  message: { error: 'Too many login attempts, please try again after 15 minutes' }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', [
  loginLimiter,
  // Validation middleware
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    
    // Generic error message for security (doesn't reveal if email exists)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Log failed attempt (in production, use a proper logging system)
      console.log(`Failed login attempt for email: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // User authenticated successfully, create JWT payload
    const payload = {
      user: {
        id: user.id,
        email: user.email
      }
    };

    // Sign the JWT token
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY },
      (err, token) => {
        if (err) throw err;
        
        // Set HTTP-only cookie with the token for enhanced security
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Secure in production
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        // Return user data and token
        res.json({
          success: true,
          token, // Also sending token in response for client-side storage if needed
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        });
      }
    );
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Auth middleware - can be used to protect routes
const auth = (req, res, next) => {
  // Get token from header or cookie
  const token = req.cookies.token || req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Example of a protected route
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 