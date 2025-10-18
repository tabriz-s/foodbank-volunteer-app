/* const express = require('express');
const router = express.Router();

// Test data (simulating what would come from database)
const mockVolunteers = [
  { id: 1, name: 'Alice Johnson', skills: ['Food Sorting', 'Customer Service'], available: true },
  { id: 2, name: 'Bob Smith', skills: ['Heavy Lifting', 'Driving'], available: true },
  { id: 3, name: 'Carol Wilson', skills: ['Administrative', 'Event Planning'], available: false }
];

const mockEvents = [
  { 
    id: 1, 
    title: 'Food Distribution', 
    date: '2024-01-15', 
    location: 'Main Food Bank',
    volunteersNeeded: 8,
    volunteersRegistered: 5
  },
  { 
    id: 2, 
    title: 'Warehouse Sorting', 
    date: '2024-01-20', 
    location: 'Warehouse District',
    volunteersNeeded: 6,
    volunteersRegistered: 2
  }
];

// GET /api/test/volunteers - Get mock volunteers
router.get('/volunteers', (req, res) => {
  res.json({
    success: true,
    data: mockVolunteers,
    message: 'Mock volunteers retrieved successfully'
  });
});

// GET /api/test/events - Get mock events
router.get('/events', (req, res) => {
  res.json({
    success: true,
    data: mockEvents,
    message: 'Mock events retrieved successfully'
  });
});

// POST /api/test/echo - Echo back what was sent
router.post('/echo', (req, res) => {
  res.json({
    success: true,
    message: 'Echo test successful',
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

module.exports = router; */