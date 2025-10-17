const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - allow requests from React app
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test routes (no database required)
app.use('/api/test', require('./routes/test'));

// Volunteer routes
app.use('/api/volunteers', require('./routes/volunteers'));

// Skill routes
app.use('/api/skills', require('./routes/skills'));

// Volunteer history routes
app.use('/api', require('./routes/history'));

// Volunteer matching routes
app.use('/api', require('./routes/matching'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'Volunteer Management API is running! 🎉',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    status: 'healthy'
  });
});

// 404 handler - FIXED: Use proper Express syntax
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested endpoint ${req.method} ${req.path} does not exist`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

module.exports = app;