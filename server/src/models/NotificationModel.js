let notifications = []; // In-memory store

// POST a notification
const addNotification = (recipientType, recipientId, message) => {
    const newNotification = {
        id: Date.now(),
        recipientType, // "admin" or "volunteer"
        recipientId,
        message,
        read: false,
        timestamp: new Date().toISOString(),
    };
    notifications.unshift(newNotification);
    return newNotification;
};

// GET notifications for a user type (admin/volunteer)
const getNotificationsByRole = (recipientType, recipientId = null, unreadOnly = false) => {
    return notifications.filter(
        (n) =>
            n.recipientType === recipientType &&
            (recipientId ? n.recipientId === recipientId : true) &&
            (!unreadOnly || !n.read)
    );
};

// PUT notification: mark as read
const markAsRead = (id) => {
    const note = notifications.find((n) => n.id === id);
    if (note) note.read = true;
    return note;
};

// DELETE a notification
const deleteNotification = (id) => {
    const before = notifications.length;
    notifications = notifications.filter((n) => n.id !== id);
    return before !== notifications.length;
};

module.exports = {
    addNotification,
    getNotificationsByRole,
    markAsRead,
    deleteNotification,
};
