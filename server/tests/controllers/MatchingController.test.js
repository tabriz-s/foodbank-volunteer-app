const {
    createMatch,
    getAllVolunteerMatches,
    getMatchesForVolunteer,
    deleteVolunteerMatch,
} = require("../../src/controllers/VolunteerMatchingController");

const { getConnection } = require("../../src/config/database");

// Mock the DB connection
jest.mock("../../src/config/database");

describe("VolunteerMatchingController (DB version)", () => {
    let req, res, mockConn;

    beforeEach(() => {
        mockConn = { query: jest.fn() };
        getConnection.mockResolvedValue(mockConn);

        req = { body: {}, params: {}, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    // ---------- createMatch ----------
    test("should return 400 if volunteerId or eventId missing", async () => {
        req.body = { eventId: 1 }; // missing volunteerId

        await createMatch(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: false })
        );
    });

    test("should insert into both volunteer_assignments and volunteer_history", async () => {
        req.body = { volunteerId: 1, eventId: 2 };
        mockConn.query.mockResolvedValueOnce([{ insertId: 10 }]); // assignments
        mockConn.query.mockResolvedValueOnce([{ insertId: 11 }]); // history

        await createMatch(req, res);

        expect(mockConn.query).toHaveBeenCalledTimes(2);
        expect(mockConn.query).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO volunteer_assignments"),
            [1, 2]
        );
        expect(mockConn.query).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO volunteer_history"),
            [1, 2]
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true })
        );
    });

    // ---------- getAllVolunteerMatches ----------
    test("should fetch all matches and return 200", async () => {
        mockConn.query.mockResolvedValueOnce([
            [
                {
                    Volunteer_id: 1,
                    Event_id: 2,
                    VolunteerName: "John Doe",
                    EventName: "Food Drive",
                },
            ],
        ]);

        await getAllVolunteerMatches(req, res);

        expect(mockConn.query).toHaveBeenCalledWith(expect.stringContaining("SELECT"));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true, data: expect.any(Array) })
        );
    });

    // ---------- getMatchesForVolunteer ----------
    test("should return matches for a volunteer", async () => {
        req.params.volunteerId = 5;
        mockConn.query.mockResolvedValueOnce([
            [{ Event_name: "Food Distribution", Location: "UH Campus" }],
        ]);

        await getMatchesForVolunteer(req, res);

        expect(mockConn.query).toHaveBeenCalledWith(
            expect.stringContaining("WHERE va.Volunteer_id = ?"),
            [5]
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true })
        );
    });

    // ---------- deleteVolunteerMatch ----------
    test("should return 400 if volunteerId or eventId missing", async () => {
        req.query = { volunteerId: 1 }; // missing eventId

        await deleteVolunteerMatch(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: false })
        );
    });

    test("should delete both assignment and history entries", async () => {
        req.query = { volunteerId: 1, eventId: 2 };
        mockConn.query.mockResolvedValue([{ affectedRows: 1 }]);

        await deleteVolunteerMatch(req, res);

        expect(mockConn.query).toHaveBeenCalledTimes(2);
        expect(mockConn.query).toHaveBeenCalledWith(
            expect.stringContaining("DELETE FROM volunteer_assignments"),
            [1, 2]
        );
        expect(mockConn.query).toHaveBeenCalledWith(
            expect.stringContaining("DELETE FROM volunteer_history"),
            [1, 2]
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true })
        );
    });
});

// ---------- ERROR handling tests ----------
describe("VolunteerMatchingController error handling", () => {
    let req, res, mockConn;

    beforeEach(() => {
        mockConn = { query: jest.fn() };
        getConnection.mockResolvedValue(mockConn);
        req = { body: {}, params: {}, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    test("createMatch should handle DB error", async () => {
        req.body = { volunteerId: 1, eventId: 2 };
        mockConn.query.mockRejectedValueOnce(new Error("DB error"));

        await createMatch(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: false })
        );
    });

    test("getAllVolunteerMatches should handle DB error", async () => {
        mockConn.query.mockRejectedValueOnce(new Error("DB error"));

        await getAllVolunteerMatches(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: false })
        );
    });

    test("getMatchesForVolunteer should handle DB error", async () => {
        req.params.volunteerId = 1;
        mockConn.query.mockRejectedValueOnce(new Error("DB error"));

        await getMatchesForVolunteer(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: false })
        );
    });

    test("deleteVolunteerMatch should handle DB error", async () => {
        req.query = { volunteerId: 1, eventId: 2 };
        mockConn.query.mockRejectedValueOnce(new Error("DB error"));

        await deleteVolunteerMatch(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: false })
        );
    });
});

