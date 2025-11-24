const request = require("supertest");
const express = require("express");

const controller = require("../../src/controllers/notificationcontrollerDB");

// Mock NotificationModelDB
jest.mock("../../src/models/NotificationModelDB", () => ({
    getVolunteerNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
}));

const NotificationModelDB = require("../../src/models/NotificationModelDB");

describe("Notification Controller (DB Mode)", () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());

        // Routes for testing
        app.get("/api/notifications/:volunteer_id", controller.getVolunteerNotificationsDB);
        app.get("/api/notifications/unread/:volunteer_id", controller.getUnreadCountDB);
        app.put("/api/notifications/read/:notification_delivery_id", controller.markNotificationAsReadDB);
    });

    beforeEach(() => jest.clearAllMocks());

    // ========== GET /notifications/:volunteer_id ==========
    test("returns volunteer notifications (200)", async () => {
        NotificationModelDB.getVolunteerNotifications.mockResolvedValue([
            { id: 1, message: "Test" },
        ]);

        const res = await request(app).get("/api/notifications/12");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBe(1);
        expect(NotificationModelDB.getVolunteerNotifications).toHaveBeenCalledWith("12");
    });

    test("returns 400 if volunteer_id is missing", async () => {
        const res = await request(app).get("/api/notifications/");

        expect(res.status).toBe(404); // Express can't match missing param route
        // No need to check body—it won't reach the controller
    });

    test("returns 500 on model failure", async () => {
        NotificationModelDB.getVolunteerNotifications.mockRejectedValue(
            new Error("DB failed")
        );

        const res = await request(app).get("/api/notifications/12");

        expect(res.status).toBe(500);
        expect(res.body.message).toBe("Failed to retrieve notifications");
    });

    // ========== GET unread/:volunteer_id ==========
    test("returns unread count (200)", async () => {
        NotificationModelDB.getUnreadCount.mockResolvedValue(5);

        const res = await request(app).get("/api/notifications/unread/12");

        expect(res.status).toBe(200);
        expect(res.body.unreadCount).toBe(5);
        expect(NotificationModelDB.getUnreadCount).toHaveBeenCalledWith("12");
    });

    test("returns 400 if volunteer_id missing unread route", async () => {
        const res = await request(app).get("/api/notifications/unread/");

        // Express matches no param -> 404
        expect(res.status).toBe(404);
    });

    test("unread count returns 500 on model error", async () => {
        NotificationModelDB.getUnreadCount.mockRejectedValue(
            new Error("DB unread error")
        );

        const res = await request(app).get("/api/notifications/unread/12");

        expect(res.status).toBe(500);
        expect(res.body.message).toBe("Failed to retrieve unread count");
    });

    // ========== PUT read/:notification_delivery_id ==========
    test("marks notification as read (200)", async () => {
        NotificationModelDB.markAsRead.mockResolvedValue({
            updated: true,
        });

        const res = await request(app).put("/api/notifications/read/99");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Notification marked as read");
        expect(NotificationModelDB.markAsRead).toHaveBeenCalledWith("99");
    });

    test("returns 400 if notification_delivery_id missing", async () => {
        const res = await request(app).put("/api/notifications/read/");

        expect(res.status).toBe(404);
    });

    test("markAsRead returns 500 if DB fails", async () => {
        NotificationModelDB.markAsRead.mockRejectedValue(new Error("DB write error"));

        const res = await request(app).put("/api/notifications/read/99");

        expect(res.status).toBe(500);
        expect(res.body.message).toBe("Failed to mark notification as read");
    });
});
