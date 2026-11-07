const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Authorized college domains helper
const DEFAULT_ALLOWED_DOMAINS = [
  'student.college.edu',
  'college.edu',
  'campus.edu',
  'kongu.edu',
  'kongu.ac.in',
];

const getAllowedDomains = () => {
  const envVal = process.env.COLLEGE_EMAIL_DOMAINS || process.env.COLLEGE_EMAIL_DOMAIN;
  if (envVal) {
    return envVal
      .split(',')
      .map((d) => d.trim().toLowerCase().replace(/^@/, ''))
      .filter(Boolean);
  }
  return DEFAULT_ALLOWED_DOMAINS;
};

const isAuthorizedCollegeEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  const allowed = getAllowedDomains();
  return allowed.some(
    (allowedDomain) => domain === allowedDomain || domain.endsWith('.' + allowedDomain)
  );
};

// Helper to generate JWT token
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'campus_marketplace_default_secret_key';
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role || 'student',
    },
    secret,
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user (student, seller, or staff)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      whatsappNumber,
      hostelBlock,
      role,
      department,
      storeName,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !whatsappNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, and WhatsApp number.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Role validation (student, seller, staff)
    const validRoles = ['student', 'seller', 'staff'];
    const assignedRole = validRoles.includes(role) ? role : 'student';

    // Location formatting depending on role
    let location = hostelBlock ? hostelBlock.trim() : '';
    if (!location) {
      if (assignedRole === 'staff') {
        location = department ? `${department.trim()} Dept` : 'Staff Cabin';
      } else if (assignedRole === 'seller') {
        location = storeName ? `${storeName.trim()}` : 'Campus Seller';
      } else {
        location = 'Campus Student';
      }
    }

    // Check if user already exists
    const normalizedEmail = email.toLowerCase().trim();

    // College Email Domain Restriction & Verification Check
    if (!isAuthorizedCollegeEmail(normalizedEmail)) {
      const allowedExamples = getAllowedDomains().map((d) => `@${d}`).join(', ');
      return res.status(400).json({
        success: false,
        message: `Registration requires an authorized college email address (e.g., ${allowedExamples}).`,
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Hash password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user (automatically verified when registered with college domain)
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      whatsappNumber: whatsappNumber.trim(),
      role: assignedRole,
      hostelBlock: location,
      department: department ? department.trim() : '',
      storeName: storeName ? storeName.trim() : '',
      isVerifiedStudent: true,
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: `${assignedRole.charAt(0).toUpperCase() + assignedRole.slice(1)} registered successfully!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerifiedStudent: user.isVerifiedStudent,
        whatsappNumber: user.whatsappNumber,
        hostelBlock: user.hostelBlock,
        department: user.department,
        storeName: user.storeName,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Register error:', error);

    // Mongoose validation error handling
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message,
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Find user by email
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // If a specific login portal was chosen (student, seller, staff), verify role match
    if (role && user.role && user.role !== role) {
      const roleNames = {
        student: 'Student',
        seller: 'Seller',
        staff: 'Faculty / Staff',
      };
      const portalNames = {
        student: 'Student Login',
        seller: 'Seller Login',
        staff: 'Staff Login',
      };
      return res.status(403).json({
        success: false,
        message: `This account is registered as ${roleNames[user.role] || user.role}. Please use the ${portalNames[user.role] || user.role} portal.`,
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'student',
        isVerifiedStudent: user.isVerifiedStudent ?? true,
        whatsappNumber: user.whatsappNumber,
        hostelBlock: user.hostelBlock,
        department: user.department || '',
        storeName: user.storeName || '',
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: error.message,
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current authenticated user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Fetch me error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user profile.',
      error: error.message,
    });
  }
});

module.exports = router;
