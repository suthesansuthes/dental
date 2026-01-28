import express from 'express';
import {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorStats,
  getSpecializations,
} from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload, uploadWithErrorHandling } from '../config/cloudinary.js';
import { doctorValidation, validate, mongoIdValidation } from '../middleware/validation.js';

const router = express.Router();

/**
 * Public Routes
 */
router.get('/', getAllDoctors);
router.get('/specializations/list', getSpecializations);
router.get('/:id', mongoIdValidation, validate, getDoctorById);

/**
 * Admin Routes
 */
router.post(
  '/',
  protect,
  authorize('admin'),
  uploadWithErrorHandling('image'),
  doctorValidation,
  validate,
  createDoctor
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  uploadWithErrorHandling('image'),
  mongoIdValidation,
  validate,
  updateDoctor
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  mongoIdValidation,
  validate,
  deleteDoctor
);

router.get(
  '/:id/stats',
  protect,
  authorize('admin'),
  mongoIdValidation,
  validate,
  getDoctorStats
);

export default router;
