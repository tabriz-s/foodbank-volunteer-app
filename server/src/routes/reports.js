const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
//const { verifyToken, requireAdmin } = require('../middleware/authMiddleware'); // I removed auth to test

router.post('/volunteers', reportController.generateVolunteerReport);
router.post('/events', reportController.generateEventReport);
router.get('/download/:filename', reportController.downloadReport);
router.get('/list', reportController.listReports);

module.exports = router;