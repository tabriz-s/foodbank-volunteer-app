const {
    addMatch,
    getAllMatches,
    getMatchesByVolunteer,
    deleteMatch,
} = require("../models/VolunteerMatchingModel");

const { addVolunteerHistory, deleteHistoryByEvent } = require("../models/VolunteerHistoryModel");

/* =======================================
   POST /api/matching
   Admin assigns volunteer to event
========================================= */
const createMatch = (req, res) => {
    const { volunteerId, eventId, eventData } = req.body;

    if (!volunteerId || !eventId) {
        return res
            .status(400)
            .json({ success: false, message: "volunteerId and eventId required" });
    }

    // Add match
    const newMatch = addMatch(volunteerId, eventId);

    // Add to volunteer history (Pending)
    const eventDetails = eventData || {
        id: eventId,
        name: "Unnamed Event",
        location: "TBD",
        date: new Date().toISOString().split("T")[0],
        urgency: "Medium",
        skills: [],
    };
    addVolunteerHistory(volunteerId, eventDetails);

    res.status(201).json({
        success: true,
        message: "Volunteer successfully matched to event.",
        data: newMatch,
    });
};

/* =======================================
   GET /api/matching
   Return all volunteer–event matches
========================================= */
const getAllVolunteerMatches = (req, res) => {
    const data = getAllMatches();
    res.status(200).json({ success: true, count: data.length, data });
};

/* =======================================
   GET /api/matching/:volunteerId
========================================= */
const getMatchesForVolunteer = (req, res) => {
    const { volunteerId } = req.params;
    const data = getMatchesByVolunteer(volunteerId);
    res.status(200).json({ success: true, count: data.length, data });
};

/* =======================================
   DELETE /api/matching
   Remove volunteer–event match
   Also remove event from history
========================================= */
const deleteVolunteerMatch = (req, res) => {
    const { volunteerId, eventId } = req.body;

    if (!volunteerId || !eventId) {
        return res
            .status(400)
            .json({ success: false, message: "volunteerId and eventId required" });
    }

    const deleted = deleteMatch(volunteerId, eventId);
    if (!deleted) {
        return res
            .status(404)
            .json({ success: false, message: "Match not found" });
    }

    // Also remove event from volunteer history
    deleteHistoryByEvent(parseInt(eventId));

    res.status(200).json({
        success: true,
        message: "Volunteer–event match deleted and history updated.",
    });
};

module.exports = {
    createMatch,
    getAllVolunteerMatches,
    getMatchesForVolunteer,
    deleteVolunteerMatch,
};
