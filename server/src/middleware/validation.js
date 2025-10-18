const { body, validationResult } = require('express-validator');


//  Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

// Registration validation rules
exports.validateRegistration = [
  body('uid')
    .notEmpty()
    .withMessage('User ID is required')
    .isString()
    .withMessage('User ID must be a string')
    .trim(),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email must not exceed 100 characters'),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['volunteer', 'employee', 'admin'])
    .withMessage('Role must be one of: volunteer, employee, admin'),

  body('displayName')
    .optional()
    .isString()
    .withMessage('Display name must be a string')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be between 1 and 50 characters'),

  handleValidationErrors
];

// Login validation rules
exports.validateLogin = [
  body('uid')
    .notEmpty()
    .withMessage('User ID is required')
    .isString()
    .withMessage('User ID must be a string')
    .trim(),

  body('idToken')
    .notEmpty()
    .withMessage('ID token is required')
    .isString()
    .withMessage('ID token must be a string'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  handleValidationErrors
];

// Profile update validation rules
exports.validateProfileUpdate = [
  body('fullName')
    .optional()
    .isString()
    .withMessage('Full name must be a string')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Full name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Full name can only contain letters, spaces, hyphens, and apostrophes'),

  body('address1')
    .optional()
    .isString()
    .withMessage('Address 1 must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Address 1 must not exceed 100 characters'),

  body('address2')
    .optional()
    .isString()
    .withMessage('Address 2 must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Address 2 must not exceed 100 characters'),

  body('city')
    .optional()
    .isString()
    .withMessage('City must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('City can only contain letters, spaces, hyphens, and apostrophes'),

  body('state')
    .optional()
    .isString()
    .withMessage('State must be a string')
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('State must be a 2-character state code')
    .isUppercase()
    .withMessage('State code must be uppercase'),

  body('zipCode')
    .optional()
    .isString()
    .withMessage('Zip code must be a string')
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Zip code must be in format 12345 or 12345-6789'),

  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array')
    .custom((value) => {
      if (value.length === 0) {
        throw new Error('At least one skill must be selected');
      }
      return true;
    }),

  body('preferences')
    .optional()
    .isString()
    .withMessage('Preferences must be a string')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Preferences must not exceed 500 characters'),

  body('availability')
    .optional()
    .isArray()
    .withMessage('Availability must be an array of dates')
    .custom((value) => {
      if (value.length === 0) {
        throw new Error('At least one available date must be selected');
      }
      // Validate each date
      value.forEach(date => {
        if (!Date.parse(date)) {
          throw new Error('Invalid date format in availability');
        }
      });
      return true;
    }),

  handleValidationErrors
];

// Event creation validation rules
exports.validateEventCreation = [
  body('eventName')
    .notEmpty()
    .withMessage('Event name is required')
    .isString()
    .withMessage('Event name must be a string')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Event name must be between 1 and 100 characters'),

  body('eventDescription')
    .notEmpty()
    .withMessage('Event description is required')
    .isString()
    .withMessage('Event description must be a string')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Event description must be between 10 and 1000 characters'),

  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isString()
    .withMessage('Location must be a string')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location must be between 1 and 200 characters'),

  body('requiredSkills')
    .notEmpty()
    .withMessage('Required skills are required')
    .isArray()
    .withMessage('Required skills must be an array')
    .custom((value) => {
      if (value.length === 0) {
        throw new Error('At least one required skill must be selected');
      }
      return true;
    }),

  body('urgency')
    .notEmpty()
    .withMessage('Urgency is required')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Urgency must be one of: low, medium, high, critical'),

  body('eventDate')
    .notEmpty()
    .withMessage('Event date is required')
    .isISO8601()
    .withMessage('Event date must be a valid date')
    .custom((value) => {
      const eventDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        throw new Error('Event date cannot be in the past');
      }
      return true;
    }),

  handleValidationErrors
];


// ID validation
exports.validateId = [
  body('id')
    .notEmpty()
    .withMessage('ID is required')
    .isString()
    .withMessage('ID must be a string'),

  handleValidationErrors
];