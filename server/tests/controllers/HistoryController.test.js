const {
    getVolunteerHistoryById,
    assignVolunteerToEvent,
    updateEventHistory,
    deleteEventHistory,
} = require("../../src/controllers/HistoryController");

const mockModel = require("../../src/models/VolunteerHistoryModel");
jest.mock("../../src/models/VolunteerHistoryModel");

describe("HistoryController", () => {
    let req, res;

    beforeEach(() => {
        req = { params: {}, body: {}, user: { id: 1, role: "admin" } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    // ------------------------------------------------------------------
    test("GET /volunteers/:id/history should return success and data", async () => {
        mockModel.getVolunteerHistory.mockReturnValue([{ eventId: 101 }]);
        req.params.id = 1;

        await getVolunteerHistoryById(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            data: expect.any(Array),
        }));
    });

    // invalid volunteer ID (NaN)
    test("GET /volunteers/:id/history should handle invalid ID", async () => {
        req.params.id = "abc";
        await getVolunteerHistoryById(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
        }));
    });

    // unauthorized volunteer (not admin, different ID)
    test("GET /volunteers/:id/history should deny access for non-admins", async () => {
        req.user = { id: 2, role: "volunteer" };
        req.params.id = 1;
        await getVolunteerHistoryById(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
    });

    // no history found
    test("GET /volunteers/:id/history should handle no history found", async () => {
        mockModel.getVolunteerHistory.mockReturnValue([]);
        req.params.id = 99;
        await getVolunteerHistoryById(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    // ------------------------------------------------------------------
    test("POST /volunteers/:id/history should add new record", async () => {
        mockModel.addVolunteerHistory.mockReturnValue([{ eventId: 999 }]);
        req.params.id = 1;
        req.body = { id: 999, name: "Test Event", date: "2025-01-01" };

        await assignVolunteerToEvent(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
        }));
    });

    // invalid volunteerId
    test("POST /volunteers/:id/history should handle invalid volunteer ID", async () => {
        req.params.id = "abc";
        req.body = { id: 1, name: "Invalid Test", date: "2025-01-01" };
        await assignVolunteerToEvent(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    // missing required fields
    test("POST /volunteers/:id/history should handle missing event fields", async () => {
        req.params.id = 1;
        req.body = { name: "No ID" };
        await assignVolunteerToEvent(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
        }));
    });

    // ------------------------------------------------------------------
    test("PUT /events/:eventId/history should update history", async () => {
        mockModel.updateHistoryByEvent.mockReturnValue(2);
        req.params.eventId = 101;
        req.body = { name: "Updated Event" };

        await updateEventHistory(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    // invalid eventId
    test("PUT /events/:eventId/history should handle invalid eventId", async () => {
        req.params.eventId = "xyz";
        await updateEventHistory(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    // no volunteer histories found
    test("PUT /events/:eventId/history should handle no updated records", async () => {
        mockModel.updateHistoryByEvent.mockReturnValue(0);
        req.params.eventId = 999;
        await updateEventHistory(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    // ------------------------------------------------------------------
    test("DELETE /events/:eventId/history should remove history", async () => {
        mockModel.deleteHistoryByEvent.mockReturnValue(3);
        req.params.eventId = 101;

        await deleteEventHistory(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    // invalid eventId
    test("DELETE /events/:eventId/history should handle invalid ID", async () => {
        req.params.eventId = "abc";
        await deleteEventHistory(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    // no records found to delete
    test("DELETE /events/:eventId/history should handle no entries found", async () => {
        mockModel.deleteHistoryByEvent.mockReturnValue(0);
        req.params.eventId = 123;
        await deleteEventHistory(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });
});
