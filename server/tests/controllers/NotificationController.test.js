const NotificationController = require("../../src/controllers/NotificationController");
const NotificationModel = require("../../src/models/NotificationModel");

jest.mock("../../src/models/NotificationModel");

describe("NotificationController", () => {
    let req, res;

    beforeEach(() => {
        req = { query: {}, body: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    test("GET /notifications returns list", () => {
        NotificationModel.getNotificationsByRole.mockReturnValue([
            { id: 1, message: "Test" },
        ]);
        req.query = { role: "admin", id: 1 };
        NotificationController.getNotifications(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true, count: 1 })
        );
    });

    test("POST /notifications creates a notification", () => {
        NotificationModel.addNotification.mockReturnValue({
            id: 1,
            message: "Created",
        });
        req.body = { recipientType: "admin", recipientId: 1, message: "Created" };
        NotificationController.createNotification(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true })
        );
    });

    test("POST /notifications missing fields", () => {
        req.body = { recipientType: "", message: "" };
        NotificationController.createNotification(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("PUT /notifications/:id/read marks as read", () => {
        NotificationModel.markAsRead.mockReturnValue({ id: 1, read: true });
        req.params = { id: 1 };
        NotificationController.markNotificationRead(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true })
        );
    });

    test("PUT /notifications/:id/read not found", () => {
        NotificationModel.markAsRead.mockReturnValue(null);
        req.params = { id: 999 };
        NotificationController.markNotificationRead(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test("DELETE /notifications/:id removes a notification", () => {
        NotificationModel.deleteNotification.mockReturnValue(true);
        req.params = { id: 1 };
        NotificationController.deleteNotification(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true })
        );
    });

    test("DELETE /notifications/:id not found", () => {
        NotificationModel.deleteNotification.mockReturnValue(false);
        req.params = { id: 2 };
        NotificationController.deleteNotification(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });
});
