const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/database');

// GET /api/stats - Get real-time dashboard stats
router.get('/', async (req, res) => {
  try {
    const pool = await getConnection();

    // Count total volunteers
    const [volunteerCount] = await pool.query(
      'SELECT COUNT(*) as count FROM volunteers'
    );

    // Count active/upcoming events (date >= today and status not cancelled/completed)
    const [eventCount] = await pool.query(
      `SELECT COUNT(*) as count FROM events 
       WHERE Date >= CURDATE() 
       AND Status IN ('planned', 'active')`
    );

    // Count total attended participations (for meals served estimate)
    const [participationCount] = await pool.query(
      `SELECT COUNT(*) as count FROM volunteer_history 
       WHERE Participation_status = 'Attended'`
    );

    // Count distinct locations from events
    const [locationCount] = await pool.query(
      `SELECT COUNT(DISTINCT Location) as count FROM events 
       WHERE Location IS NOT NULL AND Location != ''`
    );

    res.json({
      totalVolunteers: volunteerCount[0].count || 0,
      activeEvents: eventCount[0].count || 0,
      mealsServed: (participationCount[0].count || 0) * 50, // Estimate 50 meals per volunteer session
      organizationsHelped: locationCount[0].count || 0
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      message: error.message 
    });
  }
});

module.exports = router;