const express = require("express");
const router = express.Router();
const {
    createMatch,
    getAllVolunteerMatches,
    getMatchesForVolunteer,
    deleteVolunteerMatch,
} = require("../controllers/VolunteerMatchingController");
const { mockAuth } = require("../middleware/AuthMiddleware");
const { requireAdmin } = require("../middleware/RoleMiddleware");

// Authentication applies to all routes
router.use(mockAuth);

// Admin-only routes
router.post("/matching", requireAdmin, createMatch);
router.delete("/matching", requireAdmin, deleteVolunteerMatch);

// Admin or volunteer routes (read-only)
router.get("/matching", requireAdmin, getAllVolunteerMatches);
router.get("/matching/:volunteerId", requireAdmin, getMatchesForVolunteer);

module.exports = router;
