/**
 * Tests for NotificationModelDB
 */

const NotificationModelDB = require("../../src/models/NotificationModelDB");

// Mock DB connection + query
const mockQuery = jest.fn();
const mockConnection = { query: mockQuery };

jest.mock("../../src/config/database", () => ({
    getConnection: jest.fn(() => mockConnection),
}));

const { getConnection } = require("../../src/config/database");

describe("NotificationModelDB", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockQuery.mockReset();
    });

    // ============================================================
    // GET VOLUNTEER NOTIFICATIONS
    // ============================================================
    test("getVolunteerNotifications returns rows", async () => {
        const fakeRows = [{ id: 1, msg: "Hello" }];
        mockQuery.mockResolvedValue([fakeRows]);

        const result = await NotificationModelDB.getVolunteerNotifications(12);

        expect(getConnection).toHaveBeenCalled();
        expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("FROM volunteer_notifications"), [12]);
        expect(result).toEqual(fakeRows);
    });

    test("getVolunteerNotifications throws on DB error", async () => {
        mockQuery.mockRejectedValue(new Error("DB FAIL"));

        await expect(NotificationModelDB.getVolunteerNotifications(12))
            .rejects
            .toThrow("DB FAIL");
    });

    // ============================================================
    // GET UNREAD NOTIFICATIONS
    // ============================================================
    test("getUnreadNotifications returns rows", async () => {
        const rows = [{ id: 1 }];
        mockQuery.mockResolvedValue([rows]);

        const result = await NotificationModelDB.getUnreadNotifications(7);

        expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("WHERE vn.Volunteer_id = ? AND vn.Is_read = 0"), [7]);
        expect(result).toEqual(rows);
    });

    test("getUnreadNotifications fails", async () => {
        mockQuery.mockRejectedValue(new Error("Unread error"));

        await expect(NotificationModelDB.getUnreadNotifications(7))
            .rejects
            .toThrow("Unread error");
    });

    // ============================================================
    // GET UNREAD COUNT
    // ============================================================
    test("getUnreadCount returns numeric count", async () => {
        mockQuery.mockResolvedValue([[{ count: 5 }]]);

        const count = await NotificationModelDB.getUnreadCount(9);

        expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("COUNT(*) as count"), [9]);
        expect(count).toBe(5);
    });

    test("getUnreadCount error", async () => {
        mockQuery.mockRejectedValue(new Error("Count fail"));
        await expect(NotificationModelDB.getUnreadCount(9)).rejects.toThrow("Count fail");
    });

    // ============================================================
    // GET NOTIFICATION BY ID
    // ============================================================
    test("getNotificationById returns one row", async () => {
        const row = { id: 1, message: "hi" };
        mockQuery.mockResolvedValue([[row]]);

        const result = await NotificationModelDB.getNotificationById(99);

        expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("WHERE vn.Notification_delivery_id = ?"), [99]);
        expect(result).toEqual(row);
    });

    test("getNotificationById throws error", async () => {
        mockQuery.mockRejectedValue(new Error("Fetch error"));

        await expect(NotificationModelDB.getNotificationById(99))
            .rejects
            .toThrow("Fetch error");
    });

    // ============================================================
    // MARK AS READ
    // ============================================================
    test("markAsRead updates + returns updated notification", async () => {
        // 1st query: UPDATE
        mockQuery
            .mockResolvedValueOnce([{ affectedRows: 1 }])

            // 2nd query: SELECT inside getNotificationById
            .mockResolvedValueOnce([[{ id: 99, Is_read: 1 }]]);

        const result = await NotificationModelDB.markAsRead(99);

        expect(mockQuery).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining("SET Is_read = 1"),
            [99]
        );

        expect(result).toEqual({ id: 99, Is_read: 1 });
    });

    test("markAsRead throws if no rows updated", async () => {
        mockQuery.mockResolvedValueOnce([{ affectedRows: 0 }]);

        await expect(NotificationModelDB.markAsRead(50))
            .rejects
            .toThrow("Notification not found");
    });

    test("markAsRead fails on DB error", async () => {
        mockQuery.mockRejectedValue(new Error("Update fail"));

        await expect(NotificationModelDB.markAsRead(12)).rejects.toThrow("Update fail");
    });

    // ============================================================
    // MARK ALL AS READ
    // ============================================================
    test("markAllAsRead updates correct rows", async () => {
        mockQuery.mockResolvedValue([{ affectedRows: 3 }]);

        const result = await NotificationModelDB.markAllAsRead(5);

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining("WHERE Volunteer_id = ? AND Is_read = 0"),
            [5]
        );

        expect(result).toEqual({
            success: true,
            message: "Marked 3 notifications as read",
            affectedRows: 3
        });
    });

    test("markAllAsRead fails", async () => {
        mockQuery.mockRejectedValue(new Error("Mark all fail"));

        await expect(NotificationModelDB.markAllAsRead(5)).rejects.toThrow("Mark all fail");
    });

    // ============================================================
    // DELETE NOTIFICATION
    // ============================================================
    test("deleteNotification works", async () => {
        mockQuery.mockResolvedValue([{ affectedRows: 1 }]);

        const result = await NotificationModelDB.deleteNotification(42);

        expect(mockQuery).toHaveBeenCalledWith(
            "DELETE FROM event_notifications WHERE Notification_id = ?",
            [42]
        );

        expect(result).toEqual({
            success: true,
            message: "Notification deleted",
            affectedRows: 1,
        });
    });

    test("deleteNotification throws if not found", async () => {
        mockQuery.mockResolvedValue([{ affectedRows: 0 }]);

        await expect(NotificationModelDB.deleteNotification(42))
            .rejects
            .toThrow("Notification not found");
    });

    test("deleteNotification fails on DB error", async () => {
        mockQuery.mockRejectedValue(new Error("Delete fail"));

        await expect(NotificationModelDB.deleteNotification(42)).rejects.toThrow("Delete fail");
    });
});
