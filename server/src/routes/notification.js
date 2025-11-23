// server/src/routes/notification.js
const express = require("express");
const router = express.Router();
const {
    getNotifications,
    createNotification,
    markNotificationRead,
    deleteNotification,
} = require("../controllers/NotificationController");

const {
    getVolunteerNotificationsDB,
    markNotificationAsReadDB,
    getUnreadCountDB
} = require("../controllers/NotificationControllerDB.js"); // Volunteer Notifications

router.get("/notifications", getNotifications);
router.post("/notifications", createNotification);
router.put("/notifications/:id/read", markNotificationRead);
router.delete("/notifications/:id", deleteNotification);

// ============================================================================
// Volunteer Notifications
// ============================================================================

// GET /api/notifications/volunteer/:volunteer_id - Get all notifications for a volunteer
router.get("/notifications/volunteer/:volunteer_id", getVolunteerNotificationsDB);

// GET /api/notifications/volunteer/:volunteer_id/unread-count - Get unread notification count
router.get("/notifications/volunteer/:volunteer_id/unread-count", getUnreadCountDB);

// PUT /api/notifications/:notification_delivery_id/mark-read - Mark notification as read
router.put("/notifications/:notification_delivery_id/mark-read", markNotificationAsReadDB);


module.exports = router;
