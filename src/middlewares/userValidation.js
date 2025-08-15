import { body, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

export const validateCreateUser = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 50 }).withMessage('First name must be 50 characters or less'),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 50 }).withMessage('Last name must be 50 characters or less'),
  body('email').isEmail().withMessage('Must be a valid email').normalizeEmail().isLength({ max: 100 }).withMessage('Email must be 100 characters or less'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),
  body('dni').trim().notEmpty().withMessage('DNI is required').isNumeric().withMessage('DNI must be numeric').isLength({ min: 7, max: 8 }).withMessage('DNI must be 7 or 8 characters long'),
  body('phone').optional().trim().isString().isLength({ max: 20 }).withMessage('Phone must be 20 characters or less'),
  body('street').optional().trim().isString().isLength({ max: 100 }).withMessage('Street must be 100 characters or less'),
  body('city').optional().trim().isString().isLength({ max: 50 }).withMessage('City must be 50 characters or less'),
  body('state').optional().trim().isString().isLength({ max: 50 }).withMessage('State must be 50 characters or less'),
  body('country').optional().trim().isString().isLength({ max: 50 }).withMessage('Country must be 50 characters or less'),
  body('zipCode').optional().trim().isString().isLength({ max: 20 }).withMessage('Zip code must be 20 characters or less'),
  body('business_uuid').notEmpty().withMessage('business_uuid is required'),
  body('role').notEmpty().withMessage('role is required'),
  handleValidationErrors,
];

export const validateUpdateUser = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty').isLength({ max: 50 }).withMessage('First name must be 50 characters or less'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty').isLength({ max: 50 }).withMessage('Last name must be 50 characters or less'),
  body('email').optional().isEmail().withMessage('Must be a valid email').normalizeEmail().isLength({ max: 100 }).withMessage('Email must be 100 characters or less'),
  body('password').optional()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),
  body('dni').optional().trim().notEmpty().withMessage('DNI cannot be empty').isNumeric().withMessage('DNI must be numeric').isLength({ min: 7, max: 8 }).withMessage('DNI must be 7 or 8 characters long'),
  body('phone').optional().trim().isString().isLength({ max: 20 }).withMessage('Phone must be 20 characters or less'),
  body('street').optional().trim().isString().isLength({ max: 100 }).withMessage('Street must be 100 characters or less'),
  body('city').optional().trim().isString().isLength({ max: 50 }).withMessage('City must be 50 characters or less'),
  body('state').optional().trim().isString().isLength({ max: 50 }).withMessage('State must be 50 characters or less'),
  body('country').optional().trim().isString().isLength({ max: 50 }).withMessage('Country must be 50 characters or less'),
  body('zipCode').optional().trim().isString().isLength({ max: 20 }).withMessage('Zip code must be 20 characters or less'),
  handleValidationErrors,
];
