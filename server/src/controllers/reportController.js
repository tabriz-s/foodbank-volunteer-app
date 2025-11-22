const PDFDocument = require('pdfkit')
const { createObjectCsvWriter } = require('csv-writer')
const path = require('path')
const fs = require('fs').promises
const dbModule = require('../config/database')
let pool = null

// Initialize pool
async function getPool() {
  if (!pool) {
    pool = await dbModule.getConnection()
  }
  return pool
}

// .env variable to switch between mock and database
const USE_DATABASE = process.env.USE_DATABASE === 'true'

// Mock data for testing
const mockVolunteers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    eventsAttended: 5,
    totalHours: 20,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    eventsAttended: 8,
    totalHours: 32,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    eventsAttended: 3,
    totalHours: 12,
    status: 'Active',
  },
]

const mockEvents = [
  {
    id: 1,
    name: 'Food Distribution',
    date: '2024-01-15',
    volunteersAssigned: 12,
    status: 'completed',
    urgency: 'High',
  },
  {
    id: 2,
    name: 'Warehouse Work',
    date: '2024-01-20',
    volunteersAssigned: 8,
    status: 'completed',
    urgency: 'Medium',
  },
  {
    id: 3,
    name: 'Food Prep',
    date: '2024-01-25',
    volunteersAssigned: 15,
    status: 'active',
    urgency: 'High',
  },
]

// Generate Volunteer Participation Report
exports.generateVolunteerReport = async (req, res) => {
  try {
    const { format = 'pdf', startDate, endDate } = req.body
    let volunteerData = []

    console.log('USE_DATABASE:', USE_DATABASE)
    console.log('Database available:')

    if (USE_DATABASE) {
      try {
        let query = `
          SELECT 
            v.Volunteer_id as id,
            CONCAT(v.First_name, ' ', COALESCE(v.Middle_name, ''), ' ', v.Last_name) as name,
            u.Email as email,
            COUNT(DISTINCT vh.Event_id) as eventsAttended,
            SUM(CASE WHEN vh.Participation_status = 'Attended' THEN 1 ELSE 0 END) as eventsCompleted,
            'Active' as status
          FROM volunteers v
          INNER JOIN users_login u ON v.User_id = u.User_id
          LEFT JOIN volunteer_history vh ON v.Volunteer_id = vh.Volunteer_id
          WHERE 1=1
        `

        const params = []

        if (startDate) {
          query += ` AND vh.Date_participated >= ?`
          params.push(startDate)
        }
        if (endDate) {
          query += ` AND vh.Date_participated <= ?`
          params.push(endDate)
        }

        query += ` GROUP BY v.Volunteer_id, v.First_name, v.Middle_name, v.Last_name, u.Email
                   HAVING COUNT(vh.Event_id) > 0
                   ORDER BY eventsAttended DESC`

        console.log('Executing volunteer query with params:', params)
        const pool = await getPool()
        const [results] = await pool.query(query, params)
        console.log('Database returned', results.length, 'volunteers')

        if (results && results.length > 0) {
          volunteerData = results
        } else {
          console.log('No database results, using mock data')
          volunteerData = mockVolunteers
        }
      } catch (dbError) {
        console.error('Database query error:', dbError)
        volunteerData = mockVolunteers
      }
    } else {
      console.log('Using mock data (USE_DATABASE=false or no db connection)')
      volunteerData = mockVolunteers
    }

    console.log('Final volunteerData count:', volunteerData.length)

    // Generate report based on format
    if (format === 'csv') {
      const filename = await generateVolunteerCSV(volunteerData)
      res.status(200).json({
        success: true,
        message: 'Volunteer report generated successfully',
        format: 'csv',
        filename: filename,
        downloadUrl: `/reports/download/${filename}`,
        recordCount: volunteerData.length,
      })
    } else if (format === 'pdf') {
      const filename = await generateVolunteerPDF(volunteerData)
      res.status(200).json({
        success: true,
        message: 'Volunteer report generated successfully',
        format: 'pdf',
        filename: filename,
        downloadUrl: `/reports/download/${filename}`,
        recordCount: volunteerData.length,
      })
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid format. Use "pdf" or "csv"',
      })
    }
  } catch (error) {
    console.error('Generate volunteer report error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate volunteer report',
    })
  }
}

// Generate Event Assignment Report
exports.generateEventReport = async (req, res) => {
  try {
    const { format = 'pdf', startDate, endDate } = req.body
    let eventData = []

    console.log('USE_DATABASE:', USE_DATABASE)

    if (USE_DATABASE) {
      try {
        let query = `
          SELECT 
            e.Event_id as id,
            e.Event_name as name,
            DATE_FORMAT(e.Date, '%Y-%m-%d') as date,
            e.Location as location,
            e.Urgency as urgency,
            e.Status as status,
            COUNT(DISTINCT va.Volunteer_id) as volunteersAssigned,
            SUM(CASE WHEN vh.Participation_status = 'Attended' THEN 1 ELSE 0 END) as volunteersAttended
          FROM events e
          LEFT JOIN volunteer_assignments va ON e.Event_id = va.Event_id
          LEFT JOIN volunteer_history vh ON e.Event_id = vh.Event_id
          WHERE 1=1
        `

        const params = []

        if (startDate) {
          query += ` AND e.Date >= ?`
          params.push(startDate)
        }
        if (endDate) {
          query += ` AND e.Date <= ?`
          params.push(endDate)
        }

        query += ` GROUP BY e.Event_id ORDER BY e.Date DESC`

        console.log('Executing event query with params:', params)
        const pool = await getPool()
        const [results] = await pool.query(query, params)
        console.log('Database returned', results.length, 'events')

        if (results && results.length > 0) {
          eventData = results
        } else {
          console.log('No database results, using mock data')
          eventData = mockEvents
        }
      } catch (dbError) {
        console.error('Database query error:', dbError)
        eventData = mockEvents
      }
    } else {
      console.log('Using mock data (USE_DATABASE=false)')
      eventData = mockEvents
    }

    console.log('Final eventData count:', eventData.length)

    if (format === 'csv') {
      // Generate report based on format
      const filename = await generateEventCSV(eventData)
      res.status(200).json({
        success: true,
        message: 'Event report generated successfully',
        format: 'csv',
        filename: filename,
        downloadUrl: `/reports/download/${filename}`,
        recordCount: eventData.length,
      })
    } else if (format === 'pdf') {
      const filename = await generateEventPDF(eventData)
      res.status(200).json({
        success: true,
        message: 'Event report generated successfully',
        format: 'pdf',
        filename: filename,
        downloadUrl: `/reports/download/${filename}`,
        recordCount: eventData.length,
      })
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid format. Use "pdf" or "csv"',
      })
    }
  } catch (error) {
    console.error('Generate event report error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate event report',
    })
  }
}

/**
 * Download Generated Report
 * @route GET /reports/download/:filename
 */
exports.downloadReport = async (req, res) => {
  try {
    const { filename } = req.params
    const reportsDir = path.join(__dirname, '../../reports')
    const filePath = path.join(reportsDir, filename)

    // Security: Prevent directory traversal
    if (!filePath.startsWith(reportsDir)) {
      return res.status(403).json({
        success: false,
        error: 'Invalid file path',
      })
    }

    // Check if file exists
    try {
      await fs.access(filePath)
    } catch {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
      })
    }

    // Send file
    res.download(filePath, filename)
  } catch (error) {
    console.error('Download report error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to download report',
    })
  }
}

/**
 * Get List of Available Reports
 * @route GET /api/reports/list
 */
exports.listReports = async (req, res) => {
  try {
    const reportsDir = path.join(__dirname, '../../reports')

    // Create reports directory if it doesn't exist
    try {
      await fs.mkdir(reportsDir, { recursive: true })
    } catch (err) {
      // Directory might already exist
    }

    const files = await fs.readdir(reportsDir)
    const reports = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(reportsDir, filename)
        const stats = await fs.stat(filePath)
        return {
          filename,
          size: stats.size,
          created: stats.birthtime,
          type: filename.endsWith('.pdf') ? 'pdf' : 'csv',
        }
      })
    )

    res.status(200).json({
      success: true,
      reports: reports.sort((a, b) => b.created - a.created),
    })
  } catch (error) {
    console.error('List reports error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to list reports',
    })
  }
}

// HELPER FUNCTIONS

/**
 * Generate Volunteer CSV Report
 */
async function generateVolunteerCSV(data) {
  const timestamp = Date.now()
  const filename = `volunteer_report_${timestamp}.csv`
  const reportsDir = path.join(__dirname, '../../reports')
  const filePath = path.join(reportsDir, filename)

  await fs.mkdir(reportsDir, { recursive: true })

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'id', title: 'Volunteer ID' },
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'eventsAttended', title: 'Events Attended' },
      { id: 'eventsCompleted', title: 'Events Completed' },
      { id: 'status', title: 'Status' },
    ],
  })

  await csvWriter.writeRecords(data)
  return filename
}

/**
 * Generate Volunteer PDF Report
 */
async function generateVolunteerPDF(data) {
  const timestamp = Date.now()
  const filename = `volunteer_report_${timestamp}.pdf`
  const reportsDir = path.join(__dirname, '../../reports')
  const filePath = path.join(reportsDir, filename)

  await fs.mkdir(reportsDir, { recursive: true })

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 })
    const stream = require('fs').createWriteStream(filePath)

    doc.pipe(stream)

    // Header
    doc.fontSize(24).text('Volunteer Participation Report', { align: 'center' })
    doc.moveDown(0.5)
    doc
      .fontSize(10)
      .text(`Food Bank Volunteer Management System`, { align: 'center' })
    doc
      .fontSize(10)
      .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
    doc.moveDown(2)

    // Summary
    doc
      .fontSize(12)
      .text(`Total Volunteers: ${data.length}`, { underline: true })
    doc.moveDown(1)

    // Table Header
    const tableTop = doc.y
    doc.fontSize(11).font('Helvetica-Bold')
    doc.text('ID', 50, tableTop, { width: 40 })
    doc.text('Name', 90, tableTop, { width: 150 })
    doc.text('Email', 240, tableTop, { width: 150 })
    doc.text('Events', 390, tableTop, { width: 60 })
    doc.text('Status', 450, tableTop, { width: 100 })

    // Horizontal line
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke()

    // Table Rows
    doc.font('Helvetica').fontSize(9)
    let y = tableTop + 25

    data.forEach((volunteer) => {
      if (y > 700) {
        doc.addPage()
        y = 50

        // Repeat header on new page
        doc.fontSize(11).font('Helvetica-Bold')
        doc.text('ID', 50, y, { width: 40 })
        doc.text('Name', 90, y, { width: 150 })
        doc.text('Email', 240, y, { width: 150 })
        doc.text('Events', 390, y, { width: 60 })
        doc.text('Status', 450, y, { width: 100 })
        doc.font('Helvetica').fontSize(9)
        y += 20
      }

      doc.text(volunteer.id || 'N/A', 50, y, { width: 40 })
      doc.text((volunteer.name || 'N/A').substring(0, 25), 90, y, {
        width: 150,
      })
      doc.text((volunteer.email || 'N/A').substring(0, 30), 240, y, {
        width: 150,
      })
      doc.text(volunteer.eventsAttended || 0, 390, y, { width: 60 })
      doc.text(volunteer.status || 'Active', 450, y, { width: 100 })

      y += 20
    })

    // Footer
    doc
      .fontSize(8)
      .text(
        `Report generated by Food Bank Volunteer Management System - ${new Date().toLocaleDateString()}`,
        50,
        doc.page.height - 50,
        { align: 'center', width: doc.page.width - 100 }
      )

    doc.end()

    stream.on('finish', () => resolve(filename))
    stream.on('error', reject)
  })
}

/**
 * Generate Event CSV Report
 */
async function generateEventCSV(data) {
  const timestamp = Date.now()
  const filename = `event_report_${timestamp}.csv`
  const reportsDir = path.join(__dirname, '../../reports')
  const filePath = path.join(reportsDir, filename)

  await fs.mkdir(reportsDir, { recursive: true })

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'id', title: 'Event ID' },
      { id: 'name', title: 'Event Name' },
      { id: 'date', title: 'Date' },
      { id: 'location', title: 'Location' },
      { id: 'volunteersAssigned', title: 'Volunteers Assigned' },
      { id: 'volunteersAttended', title: 'Volunteers Attended' },
      { id: 'urgency', title: 'Urgency' },
      { id: 'status', title: 'Status' },
    ],
  })

  await csvWriter.writeRecords(data)
  return filename
}

/**
 * Generate Event PDF Report
 */
async function generateEventPDF(data) {
  const timestamp = Date.now()
  const filename = `event_report_${timestamp}.pdf`
  const reportsDir = path.join(__dirname, '../../reports')
  const filePath = path.join(reportsDir, filename)

  await fs.mkdir(reportsDir, { recursive: true })

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 50,
      size: 'LETTER',
      layout: 'landscape',
    })
    const stream = require('fs').createWriteStream(filePath)

    doc.pipe(stream)

    // Header
    doc.fontSize(24).text('Event Assignment Report', { align: 'center' })
    doc.moveDown(0.5)
    doc
      .fontSize(10)
      .text(`Food Bank Volunteer Management System`, { align: 'center' })
    doc
      .fontSize(10)
      .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
    doc.moveDown(2)

    // Summary
    doc.fontSize(12).text(`Total Events: ${data.length}`, { underline: true })
    doc.moveDown(1)

    // Table Header
    const tableTop = doc.y
    doc.fontSize(10).font('Helvetica-Bold')
    doc.text('ID', 50, tableTop, { width: 30 })
    doc.text('Event Name', 80, tableTop, { width: 150 })
    doc.text('Date', 230, tableTop, { width: 80 })
    doc.text('Location', 310, tableTop, { width: 120 })
    doc.text('Assigned', 430, tableTop, { width: 60 })
    doc.text('Attended', 490, tableTop, { width: 60 })
    doc.text('Urgency', 550, tableTop, { width: 70 })
    doc.text('Status', 620, tableTop, { width: 100 })

    // Horizontal line
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(720, tableTop + 15)
      .stroke()

    // Table Rows
    doc.font('Helvetica').fontSize(8)
    let y = tableTop + 25

    data.forEach((event) => {
      if (y > 500) {
        doc.addPage()
        y = 50

        // Repeat header
        doc.fontSize(10).font('Helvetica-Bold')
        doc.text('ID', 50, y, { width: 30 })
        doc.text('Event Name', 80, y, { width: 150 })
        doc.text('Date', 230, y, { width: 80 })
        doc.text('Location', 310, y, { width: 120 })
        doc.text('Assigned', 430, y, { width: 60 })
        doc.text('Attended', 490, y, { width: 60 })
        doc.text('Urgency', 550, y, { width: 70 })
        doc.text('Status', 620, y, { width: 100 })
        doc.font('Helvetica').fontSize(8)
        y += 20
      }

      doc.text(event.id || 'N/A', 50, y, { width: 30 })
      doc.text((event.name || 'N/A').substring(0, 30), 80, y, { width: 150 })
      doc.text(event.date || 'N/A', 230, y, { width: 80 })
      doc.text((event.location || 'N/A').substring(0, 20), 310, y, {
        width: 120,
      })
      doc.text(event.volunteersAssigned || 0, 430, y, { width: 60 })
      doc.text(event.volunteersAttended || 0, 490, y, { width: 60 })
      doc.text(event.urgency || 'N/A', 550, y, { width: 70 })
      doc.text(event.status || 'N/A', 620, y, { width: 100 })

      y += 18
    })

    // Footer
    doc
      .fontSize(8)
      .text(
        `Report generated by Food Bank Volunteer Management System - ${new Date().toLocaleDateString()}`,
        50,
        doc.page.height - 50,
        { align: 'center', width: doc.page.width - 100 }
      )

    doc.end()

    stream.on('finish', () => resolve(filename))
    stream.on('error', reject)
  })
}
