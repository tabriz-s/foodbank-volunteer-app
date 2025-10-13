const { body, validationResult} = require('express-validator');

const validateProfile = [
    body('full_name')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ max: 50 }).withMessage('Full name must be 50 characters or less'),
    
    // Phone Number validation
    body('phone_number')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)
        .withMessage('Please enter a valid phone number (e.g., (555) 123-4567)'),
    
    body('address_1')
        .trim()
        .notEmpty().withMessage('Address Line 1 is required')
        .isLength({ max: 100 }).withMessage('Address Line 1 must be 100 characters or less'),
    
    // Address Line 2 validation (optional)
    body('address_2')
        .optional({ checkFalsy: true })
        .isLength({ max: 100 }).withMessage('Address Line 2 must be 100 characters or less'),
    
    // City validation
    body('city')
        .trim()
        .notEmpty().withMessage('City is required')
        .isLength({ max: 100 }).withMessage('City must be 100 characters or less'),

    // State validation
    body('state')
        .trim()
        .notEmpty().withMessage('State is required')
        .isLength({ min: 2, max: 2 }).withMessage('State must be a 2-character code')
        .isAlpha().withMessage('State code must contain only letters'),

    // Zip Code validation
    body('zip_code')
        .trim()
        .notEmpty().withMessage('Zip code is required')
        .matches(/^\d{5}(-\d{4})?$/).withMessage('Zip code must be in format 12345 or 12345-6789'),
    
    // Skills validation (array of IDs)
    body('skills')
        .isArray({ min: 1 }).withMessage('Please select at least one skill')
        .custom((value) => {
            if (!value.every(id => Number.isInteger(id))) {
                throw new Error('Skills must be an array of integers');
            }
            return true;
        }),
    
    // Preferences validation (optional)
    body('preferences')
        .optional({ checkFalsy: true })
        .isString().withMessage('Preferences must be a string'),

    // Availability Days validation
    body('availability_days')
        .isArray({ min: 1 }).withMessage('Please select at least one day of availability')
        .custom((value) => {
            const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            if (!value.every(day => validDays.includes(day.toLowerCase()))) {
                throw new Error('Invalid day of week provided');
            }
            return true;
        }),

    // Middleware to check validation results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

module.exports = {
    validateProfile
};