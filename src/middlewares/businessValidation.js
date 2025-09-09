import { body, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

export const validateCreateBusiness = [
  body('name').trim().notEmpty().withMessage('Business name is required').isLength({ max: 100 }).withMessage('Business name must be 100 characters or less'),
  body('description').optional().trim().isString(),
  body('email').optional().isEmail().withMessage('Must be a valid email').normalizeEmail().isLength({ max: 100 }).withMessage('Email must be 100 characters or less'),
  body('phone').optional().trim().isString().isLength({ max: 20 }).withMessage('Phone must be 20 characters or less'),
  body('logo_url').optional().trim().isURL().withMessage('Logo URL must be a valid URL').isLength({ max: 255 }).withMessage('Logo URL must be 255 characters or less'),
  body('street').optional().trim().isString().isLength({ max: 100 }).withMessage('Street must be 100 characters or less'),
  body('city').optional().trim().isString().isLength({ max: 50 }).withMessage('City must be 50 characters or less'),
  body('state').optional().trim().isString().isLength({ max: 50 }).withMessage('State must be 50 characters or less'),
  body('country').optional().trim().isString().isLength({ max: 50 }).withMessage('Country must be 50 characters or less'),
  body('zip_code').optional().trim().isString().isLength({ max: 20 }).withMessage('Zip code must be 20 characters or less'),
  handleValidationErrors,
];

export const validateUpdateBusiness = [
  body('name').optional().trim().notEmpty().withMessage('Business name cannot be empty').isLength({ max: 100 }).withMessage('Business name must be 100 characters or less'),
  body('description').optional().trim().isString(),
  body('email').optional().isEmail().withMessage('Must be a valid email').normalizeEmail().isLength({ max: 100 }).withMessage('Email must be 100 characters or less'),
  body('phone').optional().trim().isString().isLength({ max: 20 }).withMessage('Phone must be 20 characters or less'),
  body('logo_url').optional().trim().isURL().withMessage('Logo URL must be a valid URL').isLength({ max: 255 }).withMessage('Logo URL must be 255 characters or less'),
  body('street').optional().trim().isString().isLength({ max: 100 }).withMessage('Street must be 100 characters or less'),
  body('city').optional().trim().isString().isLength({ max: 50 }).withMessage('City must be 50 characters or less'),
  body('state').optional().trim().isString().isLength({ max: 50 }).withMessage('State must be 50 characters or less'),
  body('country').optional().trim().isString().isLength({ max: 50 }).withMessage('Country must be 50 characters or less'),
  body('zip_code').optional().trim().isString().isLength({ max: 20 }).withMessage('Zip code must be 20 characters or less'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean value'),
  handleValidationErrors,
];
