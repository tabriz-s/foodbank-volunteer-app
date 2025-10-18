const express = require("express");
const request = require("supertest");
const notificationRoutes = require("../../src/routes/notification");
const NotificationModel = require("../../src/models/NotificationModel");

// Mock the model layer so routes behave predictably
jest.mock("../../src/models/NotificationModel");

describe("Notification Routes", () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use("/api", notificationRoutes);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("GET /api/notifications should return a list of notifications", async () => {
        NotificationModel.getNotificationsByRole.mockReturnValue([
            { id: 1, message: "Test Notification" },
        ]);

        const res = await request(app)
            .get("/api/notifications")
            .query({ role: "admin", id: 1 });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data[0].message).toBe("Test Notification");
    });

    test("POST /api/notifications should create a notification", async () => {
        NotificationModel.addNotification.mockReturnValue({
            id: 2,
            recipientType: "volunteer",
            recipientId: 3,
            message: "New volunteer assigned",
        });

        const res = await request(app)
            .post("/api/notifications")
            .send({
                recipientType: "volunteer",
                recipientId: 3,
                message: "New volunteer assigned",
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.message).toBe("New volunteer assigned");
    });

    test("POST /api/notifications should return 400 if fields missing", async () => {
        const res = await request(app).post("/api/notifications").send({});
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test("PUT /api/notifications/:id/read should mark as read", async () => {
        NotificationModel.markAsRead.mockReturnValue({ id: 5, read: true });

        const res = await request(app).put("/api/notifications/5/read");
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.read).toBe(true);
    });

    test("PUT /api/notifications/:id/read should return 404 if not found", async () => {
        NotificationModel.markAsRead.mockReturnValue(null);

        const res = await request(app).put("/api/notifications/999/read");
        expect(res.status).toBe(404);
    });

    test("DELETE /api/notifications/:id should delete a notification", async () => {
        NotificationModel.deleteNotification.mockReturnValue(true);

        const res = await request(app).delete("/api/notifications/10");
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test("DELETE /api/notifications/:id should return 404 if not found", async () => {
        NotificationModel.deleteNotification.mockReturnValue(false);

        const res = await request(app).delete("/api/notifications/123");
        expect(res.status).toBe(404);
    });
});
