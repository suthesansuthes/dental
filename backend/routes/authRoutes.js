import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  adminLogin,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import { registerValidation, loginValidation, validate } from '../middleware/validation.js';

const router = express.Router();

/**
 * Public Routes
 */
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/admin/login', loginValidation, validate, adminLogin);

/**
 * Protected Routes (Requires Authentication)
 */
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
