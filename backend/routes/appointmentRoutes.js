import express from 'express';
import {
  bookAppointment,
  getMyAppointments,
  getAllAppointments,
  getAppointmentById,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  getAppointmentStats,
  deleteAppointment,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { appointmentValidation, validate, mongoIdValidation } from '../middleware/validation.js';

const router = express.Router();

/**
 * Patient Routes
 */
router.post(
  '/',
  protect,
  authorize('patient'),
  appointmentValidation,
  validate,
  bookAppointment
);

router.get(
  '/my-appointments',
  protect,
  authorize('patient'),
  getMyAppointments
);

/**
 * Admin Routes
 */
router.get(
  '/stats/overview',
  protect,
  authorize('admin'),
  getAppointmentStats
);

router.get(
  '/',
  protect,
  authorize('admin'),
  getAllAppointments
);

router.put(
  '/:id/confirm',
  protect,
  authorize('admin'),
  mongoIdValidation,
  validate,
  confirmAppointment
);

router.put(
  '/:id/complete',
  protect,
  authorize('admin'),
  mongoIdValidation,
  validate,
  completeAppointment
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  mongoIdValidation,
  validate,
  deleteAppointment
);

/**
 * Shared Routes (Patient & Admin)
 */
router.get(
  '/:id',
  protect,
  mongoIdValidation,
  validate,
  getAppointmentById
);

router.put(
  '/:id/cancel',
  protect,
  mongoIdValidation,
  validate,
  cancelAppointment
);

export default router;
