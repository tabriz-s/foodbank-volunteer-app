const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/stats ... Get real-time dashboard stats
router.get('/', async (req, res) => {
  try {
    // Count total volunteers
    const [volunteerCount] = await pool.query(
      'SELECT COUNT(*) as count FROM volunteers WHERE is_active = TRUE'
    );

    // Count active/upcoming events
    const [eventCount] = await pool.query(
      'SELECT COUNT(*) as count FROM events WHERE event_date >= CURDATE()'
    );

    // Count total volunteer participations (meals served estimate)
    const [participationCount] = await pool.query(
      'SELECT COUNT(*) as count FROM volunteer_history WHERE status = "completed"'
    );

    // Count distinct organizations
    const [orgCount] = await pool.query(
      'SELECT COUNT(DISTINCT location) as count FROM events'
    );

    res.json({
      totalVolunteers: volunteerCount[0].count,
      activeEvents: eventCount[0].count,
      mealsServed: participationCount[0].count * 50, // Estimate 50 meals per volunteer session
      organizationsHelped: orgCount[0].count
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;