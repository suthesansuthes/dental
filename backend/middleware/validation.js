import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware to check validation results
 * If errors exist, return 400 with error messages
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * User Registration Validation Rules
 */
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
];

/**
 * User Login Validation Rules
 */
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Doctor Creation/Update Validation Rules
 */
export const doctorValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Doctor name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('specialization')
    .trim()
    .notEmpty()
    .withMessage('Specialization is required')
    .isIn([
      'General Dentistry',
      'Orthodontics',
      'Periodontics',
      'Endodontics',
      'Prosthodontics',
      'Oral Surgery',
      'Pediatric Dentistry',
      'Cosmetic Dentistry',
    ])
    .withMessage('Invalid specialization'),
  
  body('experience')
    .notEmpty()
    .withMessage('Experience is required')
    .isInt({ min: 0, max: 60 })
    .withMessage('Experience must be between 0 and 60 years'),
  
  body('qualification')
    .trim()
    .notEmpty()
    .withMessage('Qualification is required'),
  
  body('consultationFee')
    .notEmpty()
    .withMessage('Consultation fee is required')
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a positive number'),
  
  body('availableDays')
    .optional()
    .isArray()
    .withMessage('Available days must be an array'),
  
  body('about')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('About section cannot exceed 500 characters'),
];

/**
 * Appointment Booking Validation Rules
 */
export const appointmentValidation = [
  body('doctorId')
    .notEmpty()
    .withMessage('Doctor ID is required')
    .isMongoId()
    .withMessage('Invalid doctor ID'),
  
  body('slotId')
    .notEmpty()
    .withMessage('Slot ID is required')
    .isMongoId()
    .withMessage('Invalid slot ID'),
  
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const appointmentDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (appointmentDate < today) {
        throw new Error('Cannot book appointment for past dates');
      }
      return true;
    }),
  
  body('time')
    .notEmpty()
    .withMessage('Time is required')
    .matches(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/)
    .withMessage('Time must be in format "HH:MM AM/PM"'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
];

/**
 * Slot Creation Validation Rules
 */
export const slotValidation = [
  body('doctorId')
    .notEmpty()
    .withMessage('Doctor ID is required')
    .isMongoId()
    .withMessage('Invalid doctor ID'),
  
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('timeSlots')
    .notEmpty()
    .withMessage('Time slots are required')
    .isArray({ min: 1 })
    .withMessage('At least one time slot is required'),
  
  body('timeSlots.*')
    .matches(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/)
    .withMessage('Each time slot must be in format "HH:MM AM/PM"'),
];

/**
 * MongoDB ID Validation (for params)
 */
export const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
];

/**
 * Doctor ID Validation (for params)
 */
export const doctorIdValidation = [
  param('doctorId')
    .isMongoId()
    .withMessage('Invalid doctor ID format'),
];

/**
 * Date Query Validation
 */
export const dateQueryValidation = [
  query('date')
    .notEmpty()
    .withMessage('Date is required')
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
      return true;
    }),
];
