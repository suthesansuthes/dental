import express from 'express';
import {
  createSlots,
  getAvailableSlots,
  getDoctorSlots,
  toggleBlockSlot,
  blockDates,
  deleteSlot,
  generateTimeSlots,
  bulkCreateSlots,
} from '../controllers/slotController.js';
import { protect, authorize } from '../middleware/auth.js';
import { slotValidation, validate, mongoIdValidation, doctorIdValidation, dateQueryValidation } from '../middleware/validation.js';

const router = express.Router();

/**
 * Public Routes
 */
router.get(
  '/available/:doctorId',
  doctorIdValidation,
  dateQueryValidation,
  validate,
  getAvailableSlots
);

/**
 * Admin Routes
 */
router.get('/generate-times', protect, authorize('admin'), generateTimeSlots);

router.post(
  '/',
  protect,
  authorize('admin'),
  slotValidation,
  validate,
  createSlots
);

router.post(
  '/bulk-create',
  protect,
  authorize('admin'),
  bulkCreateSlots
);

router.get(
  '/doctor/:doctorId',
  protect,
  authorize('admin'),
  mongoIdValidation,
  validate,
  getDoctorSlots
);

router.put(
  '/:id/block',
  protect,
  authorize('admin'),
  mongoIdValidation,
  validate,
  toggleBlockSlot
);

router.post(
  '/block-dates',
  protect,
  authorize('admin'),
  blockDates
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  mongoIdValidation,
  validate,
  deleteSlot
);

export default router;
