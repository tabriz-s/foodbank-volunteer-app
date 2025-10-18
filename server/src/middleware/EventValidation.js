const { body, validationResult } = require('express-validator');

const validateEventCreate = [
    //event name validation
    body('name')
        .trim()
        .notEmpty().withMessage('Event name is required')
        .isLength({ max: 100 }).withMessage('Event name must be 100 characters or less'),

    //event description validation
    body('description')
        .trim()
        .notEmpty().withMessage('Event description is required')
        .isLength({ max: 500 }).withMessage('Event description must be 500 characters or less'),

    //location validation
    body('location')
        .trim()
        .notEmpty().withMessage('Location is required')
        .isLength({ max: 200 }).withMessage('Location must be 200 characters or less'),

    //required skills validation
    body('requiredSkills')
        .isArray({ min: 1 }).withMessage('Please select at least one required skill')
        .custom((value) => {
            if (!Array.isArray(value)) {
                throw new Error('Required skills must be an array');
            }
            for (let i = 0; i < value.length; i++) {
                if (!Number.isInteger(value[i])) {
                    throw new Error(`Skill at index ${i} must be an integer`);
                }
            }
            return true;
        }),

    //urgency validation
    body('urgency')
        .notEmpty().withMessage('Urgency is required')
        .isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Urgency must be Low, Medium, High, or Critical'),

    //event date validation
    body('date')
        .notEmpty().withMessage('Event date is required')
        .isISO8601().withMessage('Event date must be a valid date format (YYYY-MM-DD)')
        .custom((value) => {
            const eventDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (eventDate < today) {
                throw new Error('Event date must be today or in the future');
            }
            return true;
        }),

    body('status')
        .optional()
        .isIn(['upcoming', 'active', 'completed', 'cancelled']).withMessage('Status must be upcoming, active, completed, or cancelled'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(err => ({
                    field: err.path || err.param,
                    message: err.msg
                }))
            });
        }
        next();
    }
];

//validation for updating events 
const validateEventUpdate = [
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Event name cannot be empty')
        .isLength({ max: 100 }).withMessage('Event name must be 100 characters or less'),

    body('description')
        .optional()
        .trim()
        .notEmpty().withMessage('Event description cannot be empty')
        .isLength({ max: 500 }).withMessage('Event description must be 500 characters or less'),
    body('location')
        .optional()
        .trim()
        .notEmpty().withMessage('Location cannot be empty')
        .isLength({ max: 200 }).withMessage('Location must be 200 characters or less'),

    body('requiredSkills')
        .optional()
        .isArray({ min: 1 }).withMessage('Please select at least one required skill')
        .custom((value) => {
            if (!Array.isArray(value)) {
                throw new Error('Required skills must be an array');
            }
            for (let i = 0; i < value.length; i++) {
                if (!Number.isInteger(value[i])) {
                    throw new Error(`Skill at index ${i} must be an integer`);
                }
            }
            return true;
        }),

    body('urgency')
        .optional()
        .isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Urgency must be Low, Medium, High, or Critical'),

    body('date')
        .optional()
        .isISO8601().withMessage('Event date must be a valid date format (YYYY-MM-DD)')
        .custom((value) => {
            const eventDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (eventDate < today) {
                throw new Error('Event date must be today or in the future');
            }
            return true;
        }),
    body('status')
        .optional()
        .isIn(['upcoming', 'active', 'completed', 'cancelled']).withMessage('Status must be upcoming, active, completed, or cancelled'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(err => ({
                    field: err.path || err.param,
                    message: err.msg
                }))
            });
        }
        next();
    }
];
module.exports = {
    validateEventCreate,
    validateEventUpdate
};
