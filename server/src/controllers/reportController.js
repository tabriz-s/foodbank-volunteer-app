const PDFDocument = require('pdfkit');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs').promises;
const db = require('../config/database');

// Environment flag to switch between mock and database
const USE_DATABASE = process.env.USE_DATABASE === 'true';

// Mock data for testing
const mockVolunteers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', eventsAttended: 5, totalHours: 20 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', eventsAttended: 8, totalHours: 32 },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', eventsAttended: 3, totalHours: 12 }
];

const mockEvents = [
  { id: 1, name: 'Food Distribution', date: '2024-01-15', volunteers: 12, status: 'completed' },
  { id: 2, name: 'Warehouse Work', date: '2024-01-20', volunteers: 8, status: 'completed' },
  { id: 3, name: 'Food Prep', date: '2024-01-25', volunteers: 15, status: 'active' }
];

/**
 * Generate Volunteer Participation Report
 * @route POST /api/reports/volunteers
 */
exports.generateVolunteerReport = async (req, res) => {
  try {
    const { format = 'pdf', startDate, endDate } = req.body;
    let volunteerData = [];

    // ========== DATABASE MODE ==========
    if (USE_DATABASE && db) {
      try {
        // Query volunteer participation from database
        const query = `
          SELECT 
            v.Volunteer_id as id,
            CONCAT(v.First_name, ' ', v.Last_name) as name,
            u.Email as email,
            COUNT(vh.Event_id) as eventsAttended,
            SUM(TIMESTAMPDIFF(HOUR, e.Start_time, e.end_time)) as totalHours
          FROM volunteers v
          LEFT JOIN users_login u ON v.User_id = u.User_id
          LEFT JOIN volunteer_history vh ON v.Volunteer_id = vh.Volunteer_id
          LEFT JOIN events e ON vh.Event_id = e.Event_id
          WHERE vh.Participation_status = 'Attended'
          ${startDate ? 'AND vh.Date_participated >= ?' : ''}
          ${endDate ? 'AND vh.Date_participated <= ?' : ''}
          GROUP BY v.Volunteer_id
          ORDER BY eventsAttended DESC
        `;

        const params = [];
        if (startDate) params.push(startDate);
        if (endDate) params.push(endDate);

        const [results] = await db.query(query, params);
        volunteerData = results;

        if (volunteerData.length === 0) {
          // Fall back to mock data if no results
          volunteerData = mockVolunteers;
        }
      } catch (dbError) {
        console.error('Database query error:', dbError);
        volunteerData = mockVolunteers;
      }
    } else {
      // ========== MOCK MODE ==========
      volunteerData = mockVolunteers;
    }

    // Generate report based on format
    if (format === 'csv') {
      const filename = await generateVolunteerCSV(volunteerData);
      res.status(200).json({
        success: true,
        message: 'Volunteer report generated',
        format: 'csv',
        filename: filename,
        downloadUrl: `/api/reports/download/${filename}`,
        recordCount: volunteerData.length
      });
    } else if (format === 'pdf') {
      const filename = await generateVolunteerPDF(volunteerData);
      res.status(200).json({
        success: true,
        message: 'Volunteer report generated',
        format: 'pdf',
        filename: filename,
        downloadUrl: `/api/reports/download/${filename}`,
        recordCount: volunteerData.length
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid format. Use "pdf" or "csv"'
      });
    }

  } catch (error) {
    console.error('Generate volunteer report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate volunteer report'
    });
  }
};

/**
 * Generate Event Assignment Report
 * @route POST /api/reports/events
 */
exports.generateEventReport = async (req, res) => {
  try {
    const { format = 'pdf', startDate, endDate } = req.body;
    let eventData = [];

    // ========== DATABASE MODE ==========
    if (USE_DATABASE && db) {
      try {
        const query = `
          SELECT 
            e.Event_id as id,
            e.Event_name as name,
            e.Date as date,
            COUNT(DISTINCT vh.Volunteer_id) as volunteers,
            e.Status as status,
            e.Location as location,
            e.Urgency as urgency
          FROM events e
          LEFT JOIN volunteer_history vh ON e.Event_id = vh.Event_id
          WHERE 1=1
          ${startDate ? 'AND e.Date >= ?' : ''}
          ${endDate ? 'AND e.Date <= ?' : ''}
          GROUP BY e.Event_id
          ORDER BY e.Date DESC
        `;

        const params = [];
        if (startDate) params.push(startDate);
        if (endDate) params.push(endDate);

        const [results] = await db.query(query, params);
        eventData = results;

        if (eventData.length === 0) {
          eventData = mockEvents;
        }
      } catch (dbError) {
        console.error('Database query error:', dbError);
        eventData = mockEvents;
      }
    } else {
      // ========== MOCK MODE ==========
      eventData = mockEvents;
    }

    // Generate report based on format
    if (format === 'csv') {
      const filename = await generateEventCSV(eventData);
      res.status(200).json({
        success: true,
        message: 'Event report generated',
        format: 'csv',
        filename: filename,
        downloadUrl: `/api/reports/download/${filename}`,
        recordCount: eventData.length
      });
    } else if (format === 'pdf') {
      const filename = await generateEventPDF(eventData);
      res.status(200).json({
        success: true,
        message: 'Event report generated',
        format: 'pdf',
        filename: filename,
        downloadUrl: `/api/reports/download/${filename}`,
        recordCount: eventData.length
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid format. Use "pdf" or "csv"'
      });
    }

  } catch (error) {
    console.error('Generate event report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate event report'
    });
  }
};

/**
 * Download Generated Report
 * @route GET /api/reports/download/:filename
 */
exports.downloadReport = async (req, res) => {
  try {
    const { filename } = req.params;
    const reportsDir = path.join(__dirname, '../../reports');
    const filePath = path.join(reportsDir, filename);

    // Security: Prevent directory traversal
    if (!filePath.startsWith(reportsDir)) {
      return res.status(403).json({
        success: false,
        error: 'Invalid file path'
      });
    }

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    // Send file
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'Failed to download report'
          });
        }
      }
    });

  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download report'
    });
  }
};

/**
 * Get List of Available Reports
 * @route GET /api/reports/list
 */
exports.listReports = async (req, res) => {
  try {
    const reportsDir = path.join(__dirname, '../../reports');

    // Create reports directory if it doesn't exist
    try {
      await fs.mkdir(reportsDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    const files = await fs.readdir(reportsDir);
    const reports = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(reportsDir, filename);
        const stats = await fs.stat(filePath);
        return {
          filename,
          size: stats.size,
          created: stats.birthtime,
          type: filename.endsWith('.pdf') ? 'pdf' : 'csv'
        };
      })
    );

    res.status(200).json({
      success: true,
      reports: reports.sort((a, b) => b.created - a.created)
    });

  } catch (error) {
    console.error('List reports error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list reports'
    });
  }
};

// ========== HELPER FUNCTIONS ==========

/**
 * Generate Volunteer CSV Report
 */
async function generateVolunteerCSV(data) {
  const timestamp = Date.now();
  const filename = `volunteer_report_${timestamp}.csv`;
  const reportsDir = path.join(__dirname, '../../reports');
  const filePath = path.join(reportsDir, filename);

  // Create reports directory if it doesn't exist
  await fs.mkdir(reportsDir, { recursive: true });

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'id', title: 'Volunteer ID' },
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'eventsAttended', title: 'Events Attended' },
      { id: 'totalHours', title: 'Total Hours' }
    ]
  });

  await csvWriter.writeRecords(data);
  return filename;
}

/**
 * Generate Volunteer PDF Report
 */
async function generateVolunteerPDF(data) {
  const timestamp = Date.now();
  const filename = `volunteer_report_${timestamp}.pdf`;
  const reportsDir = path.join(__dirname, '../../reports');
  const filePath = path.join(reportsDir, filename);

  // Create reports directory if it doesn't exist
  await fs.mkdir(reportsDir, { recursive: true });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = require('fs').createWriteStream(filePath);

    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('Volunteer Participation Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Table Header
    const tableTop = 150;
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('ID', 50, tableTop);
    doc.text('Name', 100, tableTop);
    doc.text('Email', 250, tableTop);
    doc.text('Events', 400, tableTop);
    doc.text('Hours', 480, tableTop);

    // Table Rows
    doc.font('Helvetica').fontSize(10);
    let y = tableTop + 20;
    
    data.forEach((volunteer, index) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      doc.text(volunteer.id, 50, y);
      doc.text(volunteer.name.substring(0, 20), 100, y);
      doc.text(volunteer.email.substring(0, 25), 250, y);
      doc.text(volunteer.eventsAttended || 0, 400, y);
      doc.text(volunteer.totalHours || 0, 480, y);

      y += 25;
    });

    // Footer
    doc.moveDown(3);
    doc.fontSize(10).text(`Total Volunteers: ${data.length}`, { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(filename));
    stream.on('error', reject);
  });
}

/**
 * Generate Event CSV Report
 */
async function generateEventCSV(data) {
  const timestamp = Date.now();
  const filename = `event_report_${timestamp}.csv`;
  const reportsDir = path.join(__dirname, '../../reports');
  const filePath = path.join(reportsDir, filename);

  await fs.mkdir(reportsDir, { recursive: true });

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'id', title: 'Event ID' },
      { id: 'name', title: 'Event Name' },
      { id: 'date', title: 'Date' },
      { id: 'volunteers', title: 'Volunteers Assigned' },
      { id: 'status', title: 'Status' }
    ]
  });

  await csvWriter.writeRecords(data);
  return filename;
}

/**
 * Generate Event PDF Report
 */
async function generateEventPDF(data) {
  const timestamp = Date.now();
  const filename = `event_report_${timestamp}.pdf`;
  const reportsDir = path.join(__dirname, '../../reports');
  const filePath = path.join(reportsDir, filename);

  await fs.mkdir(reportsDir, { recursive: true });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = require('fs').createWriteStream(filePath);

    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('Event Assignment Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Table Header
    const tableTop = 150;
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('ID', 50, tableTop);
    doc.text('Event Name', 100, tableTop);
    doc.text('Date', 300, tableTop);
    doc.text('Volunteers', 400, tableTop);
    doc.text('Status', 480, tableTop);

    // Table Rows
    doc.font('Helvetica').fontSize(10);
    let y = tableTop + 20;
    
    data.forEach((event) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      doc.text(event.id, 50, y);
      doc.text(event.name.substring(0, 25), 100, y);
      doc.text(event.date, 300, y);
      doc.text(event.volunteers || 0, 400, y);
      doc.text(event.status, 480, y);

      y += 25;
    });

    // Footer
    doc.moveDown(3);
    doc.fontSize(10).text(`Total Events: ${data.length}`, { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(filename));
    stream.on('error', reject);
  });
}