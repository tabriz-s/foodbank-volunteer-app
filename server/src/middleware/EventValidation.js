const { body, validationResult } = require('express-validator');

//Validation for creating events
const validateEventCreate = [
    body('name')
        .trim()
        .notEmpty().withMessage('Event name is required')
        .isLength({ max: 100 }).withMessage('Event name must be 100 characters or less'),
    
    body('description')
        .trim()
        .notEmpty().withMessage('Event description is required'),
    
    body('location')
        .trim()
        .notEmpty().withMessage('Location is required'),
    
    body('urgency')
        .notEmpty().withMessage('Urgency level is required')
        .isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid urgency level'),
    
    body('date')
        .notEmpty().withMessage('Event date is required')
        .isISO8601().withMessage('Invalid date format'),
    
    body('requiredSkills')
        .isArray({ min: 1 }).withMessage('At least one skill must be selected'),
    
    //Middleware to check validation results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
];

//Validation for updating events
const validateEventUpdate = [
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Event name cannot be empty')
        .isLength({ max: 100 }).withMessage('Event name must be 100 characters or less'),
    
    body('description')
        .optional()
        .trim()
        .notEmpty().withMessage('Event description cannot be empty'),
    
    body('location')
        .optional()
        .trim()
        .notEmpty().withMessage('Location cannot be empty'),
    
    body('urgency')
        .optional()
        .isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid urgency level'),
    
    body('date')
        .optional()
        .isISO8601().withMessage('Invalid date format'),
    
    body('requiredSkills')
        .optional()
        .isArray().withMessage('Required skills must be an array'),
    
    body('status')
        .optional()
        .isIn(['planned', 'active', 'completed', 'cancelled']).withMessage('Invalid status'),
    
    // Middleware to check validation results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
];

module.exports = {
    validateEventCreate,
    validateEventUpdate
};
