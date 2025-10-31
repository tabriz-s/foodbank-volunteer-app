const express = require("express");
const router = express.Router();
const {
    createMatch,
    getAllVolunteerMatches,
    getMatchesForVolunteer,
    deleteVolunteerMatch,
} = require("../controllers/VolunteerMatchingController");

// Routes
router.post("/", createMatch);
router.get("/", getAllVolunteerMatches);
router.get("/:volunteerId", getMatchesForVolunteer);
router.delete("/", deleteVolunteerMatch);

module.exports = router;
