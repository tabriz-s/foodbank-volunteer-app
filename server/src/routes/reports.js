const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/reports/volunteers
 * @desc    Generate volunteer participation report (PDF or CSV)
 * @access  Admin only
 * @body    { format: 'pdf' | 'csv', startDate?: string, endDate?: string }
 */
router.post('/volunteers', verifyToken, requireAdmin, reportController.generateVolunteerReport);

/**
 * @route   POST /api/reports/events
 * @desc    Generate event assignment report (PDF or CSV)
 * @access  Admin only
 * @body    { format: 'pdf' | 'csv', startDate?: string, endDate?: string }
 */
router.post('/events', verifyToken, requireAdmin, reportController.generateEventReport);

/**
 * @route   GET /api/reports/download/:filename
 * @desc    Download a generated report
 * @access  Admin only
 */
router.get('/download/:filename', verifyToken, requireAdmin, reportController.downloadReport);

/**
 * @route   GET /api/reports/list
 * @desc    Get list of all generated reports
 * @access  Admin only
 */
router.get('/list', verifyToken, requireAdmin, reportController.listReports);

module.exports = router;