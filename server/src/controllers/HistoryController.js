const { getConnection } = require("../config/database");

/**
 * GET /api/volunteers/:id/history
 * Fetch volunteer's event history from MySQL
 */
const getVolunteerHistoryById = async (req, res) => {
    const volunteerId = parseInt(req.params.id, 10);
    const user = req.user; // Comes from authentication middleware

    if (isNaN(volunteerId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid volunteer ID",
        });
    }

    // 🔒 Access control
    if (user.role !== "admin" && user.id !== volunteerId) {
        return res.status(403).json({
            success: false,
            message: "Access denied: volunteers can only view their own history.",
        });
    }

    try {
        const connection = await getConnection();

        // 🧭 Fetch volunteer name
        const [volunteerRows] = await connection.query(
            "SELECT First_name, Last_name FROM Volunteers WHERE Volunteer_id = ?",
            [volunteerId]
        );

        if (volunteerRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Volunteer not found",
            });
        }

        const volunteerName = `${volunteerRows[0].First_name} ${volunteerRows[0].Last_name}`;

        // 📜 Fetch history entries
        const [rows] = await connection.query(
            `
                SELECT
                    vh.History_id,
                    e.Event_name AS Event,
                    e.Description AS EventDescription,
                    e.Location,
                    e.Date AS EventDate,
                    e.Skill_needed AS Skills,
                    e.Urgency,
                    vh.Participation_status AS Status
                FROM Volunteer_History vh
                         JOIN Events e ON vh.Event_id = e.Event_id
                WHERE vh.Volunteer_id = ?
                ORDER BY e.Date DESC
            `,
            [volunteerId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No history found for ${volunteerName}`,
                data: [],
            });
        }

        res.status(200).json({
            success: true,
            volunteerId,
            volunteerName,
            count: rows.length,
            data: rows,
        });
    } catch (err) {
        console.error("Error fetching volunteer history:", err);
        res.status(500).json({
            success: false,
            message: "Server error while retrieving volunteer history",
        });
    }
};



/**
 * POST /api/volunteers/:id/history
 * Add a new volunteer-event record
 */
const assignVolunteerToEvent = async (req, res) => {
    const volunteerId = parseInt(req.params.id, 10);
    const { event_id, performance, participation_status, date_participated } = req.body;

    if (isNaN(volunteerId) || !event_id || !participation_status) {
        return res.status(400).json({
            success: false,
            message: "Missing required data (volunteer_id, event_id, participation_status)",
        });
    }

    try {
        const connection = await getConnection();
        await connection.query(
            `
      INSERT INTO Volunteer_History (Volunteer_id, Event_id, Performance, Participation_status, Date_participated)
      VALUES (?, ?, ?, ?, ?)
      `,
            [volunteerId, event_id, performance || null, participation_status, date_participated || new Date()]
        );

        res.status(201).json({ success: true, message: "Volunteer history added successfully" });
    } catch (err) {
        console.error("Error adding history:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * PUT /api/events/:eventId/history
 * Update all records for an event
 */
const updateEventHistory = async (req, res) => {
    const eventId = parseInt(req.params.eventId, 10);
    const { participation_status, performance } = req.body;

    if (isNaN(eventId)) {
        return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    try {
        const connection = await getConnection();
        const [result] = await connection.query(
            `
      UPDATE Volunteer_History
      SET Performance = COALESCE(?, Performance),
          Participation_status = COALESCE(?, Participation_status)
      WHERE Event_id = ?
      `,
            [performance, participation_status, eventId]
        );

        res.status(200).json({
            success: true,
            message: `Updated ${result.affectedRows} volunteer history entries`,
        });
    } catch (err) {
        console.error("Error updating event history:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * DELETE /api/events/:eventId/history
 * Delete all volunteer history when event is deleted
 */
const deleteEventHistory = async (req, res) => {
    const eventId = parseInt(req.params.eventId, 10);

    if (isNaN(eventId)) {
        return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    try {
        const connection = await getConnection();
        const [result] = await connection.query(
            "DELETE FROM Volunteer_History WHERE Event_id = ?",
            [eventId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: `No history entries found for event ${eventId}`,
            });
        }

        res.status(200).json({
            success: true,
            message: `Deleted ${result.affectedRows} volunteer history entries`,
        });
    } catch (err) {
        console.error("Error deleting event history:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    getVolunteerHistoryById,
    assignVolunteerToEvent,
    updateEventHistory,
    deleteEventHistory,
};
