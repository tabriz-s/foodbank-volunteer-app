const {
    getVolunteerHistory,
    addVolunteerHistory,
    updateHistoryByEvent,
    deleteHistoryByEvent,
} = require("../models/VolunteerHistoryModel");

const { volunteers } = require("../models/VolunteerModel"); // for name lookup

/* =======================================
   GET /api/volunteers/:id/history
   View volunteer's event history
   - Volunteers can see their own
   - Admins can view any volunteer's history
========================================= */
const getVolunteerHistoryById = (req, res) => {
    const volunteerId = parseInt(req.params.id, 10);
    const user = req.user;

    // Access control
    if (user.role !== "admin" && user.id !== volunteerId) {
        return res.status(403).json({
            success: false,
            message: "Access denied: volunteers can only view their own history.",
        });
    }

    if (isNaN(volunteerId)) {
        return res
            .status(400)
            .json({ success: false, message: "Invalid volunteer ID" });
    }

    const history = getVolunteerHistory(volunteerId);
    const volunteer = volunteers
        ? volunteers.find(v => v.Volunteer_id === volunteerId)
        : null;

    if (!history.length) {
        return res.status(404).json({
            success: false,
            message: `No history found for volunteer ${volunteerId}`,
            data: [],
        });
    }

    res.status(200).json({
        success: true,
        volunteerId,
        name: volunteer
            ? `${volunteer.First_name} ${volunteer.Last_name}`
            : "Unknown Volunteer",
        count: history.length,
        data: history,
    });
};

/* =======================================
   POST /api/volunteers/:id/history
   Add new history entry when volunteer assigned to event
   - Pulls event data (mocked for now)
   - Sets status: "Pending"
========================================= */
const assignVolunteerToEvent = (req, res) => {
    const volunteerId = parseInt(req.params.id, 10);
    const eventData = req.body;

    if (isNaN(volunteerId)) {
        return res
            .status(400)
            .json({ success: false, message: "Invalid volunteer ID" });
    }

    if (!eventData.id || !eventData.name || !eventData.date) {
        return res.status(400).json({
            success: false,
            message: "Missing required event data (id, name, date)",
        });
    }

    const updatedHistory = addVolunteerHistory(volunteerId, eventData);

    res.status(201).json({
        success: true,
        message: "Volunteer assigned and history updated",
        count: updatedHistory.length,
        data: updatedHistory,
    });
};

/* =======================================
   PUT /api/events/:eventId/history
   Update all history records when event is modified
========================================= */
const updateEventHistory = (req, res) => {
    const eventId = parseInt(req.params.eventId, 10);
    const eventData = { ...req.body, id: eventId };

    if (isNaN(eventId)) {
        return res
            .status(400)
            .json({ success: false, message: "Invalid event ID" });
    }

    const updatedCount = updateHistoryByEvent(eventData);

    if (updatedCount === 0) {
        return res.status(404).json({
            success: false,
            message: `No volunteer histories found for event ${eventId}`,
        });
    }

    res.status(200).json({
        success: true,
        message: `Updated ${updatedCount} volunteer history entries`,
    });
};

/* =======================================
   DELETE /api/events/:eventId/history
   Delete all volunteer history records when event is deleted
========================================= */
const deleteEventHistory = (req, res) => {
    const eventId = parseInt(req.params.eventId, 10);

    if (isNaN(eventId)) {
        return res
            .status(400)
            .json({ success: false, message: "Invalid event ID" });
    }

    const deletedCount = deleteHistoryByEvent(eventId);

    if (deletedCount === 0) {
        return res.status(404).json({
            success: false,
            message: `No history entries found for event ${eventId}`,
        });
    }

    res.status(200).json({
        success: true,
        message: `Deleted ${deletedCount} history entries for event ${eventId}`,
    });
};

module.exports = {
    getVolunteerHistoryById,
    assignVolunteerToEvent,
    updateEventHistory,
    deleteEventHistory,
};
