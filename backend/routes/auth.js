const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};


router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
 
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

   
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

   
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    
    const user = await User.create({
      username,
      email,
      password
    });

    if (user) {
      return res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          solvedCount: user.solvedCount
        }
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
   
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    return res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        solvedCount: user.solvedCount
      }
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    return res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Auth Profile Retrieval Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
