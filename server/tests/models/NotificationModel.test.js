const NotificationModel = require("../../src/models/NotificationModel");

describe("NotificationModel", () => {
    beforeEach(() => {
        // reset the module cache to clear notifications array between tests
        jest.resetModules();
    });

    test("should add a new notification", () => {
        const note = NotificationModel.addNotification("admin", 1, "Test message");
        expect(note).toHaveProperty("id");
        expect(note.recipientType).toBe("admin");
        expect(note.read).toBe(false);
    });

    test("should get notifications by role and recipientId", () => {
        NotificationModel.addNotification("volunteer", 1, "Volunteer note 1");
        NotificationModel.addNotification("volunteer", 2, "Volunteer note 2");
        const notes = NotificationModel.getNotificationsByRole("volunteer", 1);
        expect(notes.length).toBe(1);
        expect(notes[0].message).toContain("Volunteer note 1");
    });

    test("should mark a notification as read", () => {
        const note = NotificationModel.addNotification("admin", 1, "Admin note");
        const result = NotificationModel.markAsRead(note.id);
        expect(result.read).toBe(true);
    });

    test("should delete a notification by id", () => {
        const note = NotificationModel.addNotification("admin", 2, "Delete this");
        const deleted = NotificationModel.deleteNotification(note.id);
        expect(deleted).toBe(true);
        const remaining = NotificationModel.getNotificationsByRole("admin", 2);
        expect(remaining.length).toBe(0);
    });

    test("should correctly filter by unreadOnly and handle null recipientId", () => {
        // reset notifications first
        jest.resetModules();
        const NotificationModel = require("../../src/models/NotificationModel");

        // Add sample notifications
        NotificationModel.addNotification("volunteer", 1, "Read message");
        NotificationModel.addNotification("volunteer", 2, "Unread message");

        // Mark one as read manually
        const allNotes = NotificationModel.getNotificationsByRole("volunteer");
        allNotes[0].read = true;

        // unreadOnly = true should only return unread ones
        const unread = NotificationModel.getNotificationsByRole("volunteer", null, true);
        expect(unread.every((n) => !n.read)).toBe(true);

        // Ensure it returns at least one item and not the read one
        expect(unread.length).toBe(1);
        expect(unread[0].message).toBe("Unread message");
    });

});
