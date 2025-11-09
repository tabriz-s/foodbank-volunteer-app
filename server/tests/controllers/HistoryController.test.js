const {
    getVolunteerHistoryById,
    assignVolunteerToEvent,
    updateEventHistory,
    deleteEventHistory,
} = require("../../src/controllers/HistoryController");

const { getConnection } = require("../../src/config/database");

// mock DB connection
jest.mock("../../src/config/database");

describe("HistoryController (DB version)", () => {
    let req, res, mockConn;

    beforeEach(() => {
        mockConn = { query: jest.fn() };
        getConnection.mockResolvedValue(mockConn);
        req = { params: {}, body: {}, user: { id: 1, role: "admin" } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    // ----------------------------------------------------------
    describe("getVolunteerHistoryById", () => {
        test("should return 400 for invalid volunteer ID", async () => {
            req.params.id = "abc";
            await getVolunteerHistoryById(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should return 403 if non-admin tries to access another volunteer", async () => {
            req.user = { id: 5, role: "volunteer" };
            req.params.id = 1;
            await getVolunteerHistoryById(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
        });

        test("should return 404 if volunteer not found", async () => {
            req.params.id = 1;
            mockConn.query
                .mockResolvedValueOnce([[]]); // no volunteer
            await getVolunteerHistoryById(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        test("should return 404 if no history found", async () => {
            req.params.id = 1;
            mockConn.query
                .mockResolvedValueOnce([[{ First_name: "Test", Last_name: "User" }]]) // volunteer found
                .mockResolvedValueOnce([[]]); // no history
            await getVolunteerHistoryById(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        test("should return 200 with history", async () => {
            req.params.id = 1;
            mockConn.query
                .mockResolvedValueOnce([[{ First_name: "John", Last_name: "Doe" }]])
                .mockResolvedValueOnce([[{ Event: "Food Drive" }]]);
            await getVolunteerHistoryById(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, data: expect.any(Array) })
            );
        });

        test("should handle DB error", async () => {
            req.params.id = 1;
            mockConn.query.mockRejectedValueOnce(new Error("DB error"));
            await getVolunteerHistoryById(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // ----------------------------------------------------------
    describe("assignVolunteerToEvent", () => {
        test("should return 400 if data missing", async () => {
            req.params.id = 1;
            req.body = {};
            await assignVolunteerToEvent(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should insert successfully", async () => {
            req.params.id = 1;
            req.body = {
                event_id: 2,
                participation_status: "Registered",
                performance: "Good",
            };
            mockConn.query.mockResolvedValueOnce([{ insertId: 10 }]);
            await assignVolunteerToEvent(req, res);
            expect(mockConn.query).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });

        test("should handle DB error", async () => {
            req.params.id = 1;
            req.body = {
                event_id: 2,
                participation_status: "Registered",
            };
            mockConn.query.mockRejectedValueOnce(new Error("DB error"));
            await assignVolunteerToEvent(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // ----------------------------------------------------------
    describe("updateEventHistory", () => {
        test("should return 400 for invalid event ID", async () => {
            req.params.eventId = "bad";
            await updateEventHistory(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should update and return 200", async () => {
            req.params.eventId = 5;
            req.body = { participation_status: "Attended" };
            mockConn.query.mockResolvedValueOnce([{ affectedRows: 2 }]);
            await updateEventHistory(req, res);
            expect(mockConn.query).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test("should handle DB error", async () => {
            req.params.eventId = 5;
            mockConn.query.mockRejectedValueOnce(new Error("DB error"));
            await updateEventHistory(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // ----------------------------------------------------------
    describe("deleteEventHistory", () => {
        test("should return 400 for invalid event ID", async () => {
            req.params.eventId = "abc";
            await deleteEventHistory(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should return 404 if no rows deleted", async () => {
            req.params.eventId = 3;
            mockConn.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
            await deleteEventHistory(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        test("should delete and return 200", async () => {
            req.params.eventId = 3;
            mockConn.query.mockResolvedValueOnce([{ affectedRows: 2 }]);
            await deleteEventHistory(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test("should handle DB error", async () => {
            req.params.eventId = 3;
            mockConn.query.mockRejectedValueOnce(new Error("DB error"));
            await deleteEventHistory(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
