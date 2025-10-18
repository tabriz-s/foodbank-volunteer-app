// server/src/routes/notification.js
const express = require("express");
const router = express.Router();
const {
    getNotifications,
    createNotification,
    markNotificationRead,
    deleteNotification,
} = require("../controllers/NotificationController");

router.get("/notifications", getNotifications);
router.post("/notifications", createNotification);
router.put("/notifications/:id/read", markNotificationRead);
router.delete("/notifications/:id", deleteNotification);

module.exports = router;
