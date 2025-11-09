const { getConnection } = require("../config/database");

// (1) Assign a volunteer to an event
const createMatch = async (req, res) => {
    const { volunteerId, eventId } = req.body;

    if (!volunteerId || !eventId) {
        return res
            .status(400)
            .json({ success: false, message: "volunteerId and eventId are required" });
    }

    try {
        const conn = await getConnection();

        // Insert into volunteer_assignments
        await conn.query(
            `INSERT INTO volunteer_assignments (Volunteer_id, Event_id, Assigned_date, Assignment_status, assigned_by)
             VALUES (?, ?, NOW(), 'Confirmed', 1)`, // 1 is a sample Employee_ID, call dynamically later
            [volunteerId, eventId]
        );


        // Also insert into volunteer_history with status 'Registered'
        await conn.query(
            `INSERT INTO volunteer_history (Volunteer_id, Event_id, Participation_status, Performance, Date_participated)
       VALUES (?, ?, 'Registered', NULL, CURDATE())`,
            [volunteerId, eventId]
        );

        res.status(201).json({
            success: true,
            message: "Volunteer successfully assigned and history created.",
        });
    } catch (err) {
        console.error("Error creating match:", err);
        res.status(500).json({ success: false, message: "Server error", error: err });
    }
};

// (2) Get all matches (joins volunteers + events)
const getAllVolunteerMatches = async (req, res) => {
    try {
        const conn = await getConnection();
        const [rows] = await conn.query(`
            SELECT
                va.Volunteer_id,
                va.Event_id,
                CONCAT(v.First_name, ' ', v.Last_name) AS VolunteerName,
                e.Event_name AS EventName
            FROM volunteer_assignments va
                     JOIN volunteers v ON va.Volunteer_id = v.Volunteer_id
                     JOIN events e ON va.Event_id = e.Event_id
        `);

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows,
        });
    } catch (err) {
        console.error("Error fetching matches:", err);
        res.status(500).json({
            success: false,
            message: "Server error fetching matches.",
        });
    }
};

// (3) Get matches for specific volunteer
const getMatchesForVolunteer = async (req, res) => {
    const { volunteerId } = req.params;
    try {
        const conn = await getConnection();
        const [rows] = await conn.query(
            `
      SELECT va.Assignment_id, e.Event_name, e.Location, e.Urgency, e.Date
      FROM volunteer_assignments va
      JOIN events e ON va.Event_id = e.Event_id
      WHERE va.Volunteer_id = ?
      ORDER BY e.Date DESC
      `,
            [volunteerId]
        );

        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        console.error("Error fetching volunteer matches:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// (4) Delete a volunteer match (and corresponding history)
const deleteVolunteerMatch = async (req, res) => {
    const volunteerId = req.query.volunteerId;
    const eventId = req.query.eventId;

    if (!volunteerId || !eventId) {
        return res
            .status(400)
            .json({ success: false, message: "volunteerId and eventId required" });
    }

    try {
        const conn = await getConnection();

        await conn.query(
            "DELETE FROM volunteer_assignments WHERE Volunteer_id = ? AND Event_id = ?",
            [volunteerId, eventId]
        );

        await conn.query(
            "DELETE FROM volunteer_history WHERE Volunteer_id = ? AND Event_id = ?",
            [volunteerId, eventId]
        );

        res.status(200).json({
            success: true,
            message: "Volunteer unassigned and history removed.",
        });
    } catch (err) {
        console.error("Error deleting match:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    createMatch,
    getAllVolunteerMatches,
    getMatchesForVolunteer,
    deleteVolunteerMatch,
};
