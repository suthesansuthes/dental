import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ErrorResponse } from '../middleware/errorHandler.js';

/**
 * @desc    Register a new user (patient)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  
  // Log incoming registration data for debugging
  console.log('📝 Registration attempt:', { 
    name, 
    email, 
    phone,
    passwordLength: password?.length,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  });

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ErrorResponse('User already exists with this email', 400);
  }

  // Create user (patient by default)
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: 'patient',
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    },
  });
});

/**
 * @desc    Login user (patient or admin)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ErrorResponse('Your account has been deactivated. Please contact support.', 401);
  }

  // Verify password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    },
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone) user.phone = phone;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    },
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ErrorResponse('Please provide current and new password', 400);
  }

  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isPasswordCorrect) {
    throw new ErrorResponse('Current password is incorrect', 401);
  }

  // Set new password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

/**
 * @desc    Admin login
 * @route   POST /api/auth/admin/login
 * @access  Public
 */
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find admin user
  const user = await User.findOne({ email, role: 'admin' }).select('+password');

  if (!user) {
    throw new ErrorResponse('Invalid admin credentials', 401);
  }

  // Check if admin is active
  if (!user.isActive) {
    throw new ErrorResponse('Admin account has been deactivated', 401);
  }

  // Verify password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new ErrorResponse('Invalid admin credentials', 401);
  }

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Admin login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});
