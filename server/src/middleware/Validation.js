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
    
    // Skills validation 
    body('skills')
        .isArray({ min: 1 }).withMessage('Please select at least one skill')
        .custom((value) => {
            // Check that skills is an array of objects
            if (!Array.isArray(value)) {
                throw new Error('Skills must be an array');
            }

            // Each skill must be an object with required fields
            for (let i = 0; i < value.length; i++) {
                const skill = value[i];

                // Check Skills_id exists and is a number
                if (!skill.Skills_id || !Number.isInteger(skill.Skills_id)) {
                    throw new Error(`Skill at index ${i}: Skills_id must be an integer`);
                }

                // Check Experience_level exists and is valid
                const validLevels = ['beginner', 'intermediate', 'expert'];
                if (!skill.Experience_level || !validLevels.includes(skill.Experience_level.toLowerCase())) {
                    throw new Error(`Skill at index ${i}: Experience_level must be 'beginner', 'intermediate', or 'expert'`);
                }

                // Check Date_acquired exists and is a valid date format
                if (!skill.Date_acquired) {
                    throw new Error(`Skill at index ${i}: Date_acquired is required`);
                }

                // Validate date format (YYYY-MM-DD)
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(skill.Date_acquired)) {
                    throw new Error(`Skill at index ${i}: Date_acquired must be in format YYYY-MM-DD`);
                }
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