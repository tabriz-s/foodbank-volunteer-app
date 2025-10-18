const NotificationModel = require("../models/NotificationModel");

// GET notifications for a specific user type
const getNotifications = (req, res) => {
    const { role, id } = req.query; // e.g., /api/notifications?role=volunteer&id=1
    const data = NotificationModel.getNotificationsByRole(role, id ? Number(id) : null);
    res.status(200).json({ success: true, count: data.length, data });
};

// POST create a new notification
const createNotification = (req, res) => {
    const { recipientType, recipientId, message } = req.body;
    if (!recipientType || !message) {
        return res.status(400).json({ success: false, message: "Missing fields" });
    }
    const note = NotificationModel.addNotification(recipientType, recipientId, message);
    res.status(201).json({ success: true, data: note });
};

// PUT mark as read
const markNotificationRead = (req, res) => {
    const { id } = req.params;
    const note = NotificationModel.markAsRead(Number(id));
    if (!note) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, data: note });
};

// DELETE a notification
const deleteNotification = (req, res) => {
    const { id } = req.params;
    const deleted = NotificationModel.deleteNotification(Number(id));
    if (!deleted) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, message: "Deleted successfully" });
};

module.exports = {
    getNotifications,
    createNotification,
    markNotificationRead,
    deleteNotification,
};
