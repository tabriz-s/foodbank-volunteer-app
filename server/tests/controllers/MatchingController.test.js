const {
    createMatch,
    getAllVolunteerMatches,
    getMatchesForVolunteer,
    deleteVolunteerMatch,
} = require("../../src/controllers/VolunteerMatchingController");

const matchingModel = require("../../src/models/VolunteerMatchingModel");
const historyModel = require("../../src/models/VolunteerHistoryModel");

jest.mock("../../src/models/VolunteerMatchingModel");
jest.mock("../../src/models/VolunteerHistoryModel");

describe("VolunteerMatchingController", () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    // ---------- createMatch ----------
    test("should return 400 if volunteerId or eventId missing", () => {
        req.body = { eventId: 1 }; // missing volunteerId
        createMatch(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: false })
        );
    });

    test("should create match and add to history", () => {
        req.body = { volunteerId: 1, eventId: 101, eventData: { id: 101, name: "Test" } };
        matchingModel.addMatch.mockReturnValue({ volunteerId: 1, eventId: 101 });
        historyModel.addVolunteerHistory.mockReturnValue(true);

        createMatch(req, res);
        expect(matchingModel.addMatch).toHaveBeenCalled();
        expect(historyModel.addVolunteerHistory).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });

    // ---------- getAllVolunteerMatches ----------
    test("should get all matches", () => {
        matchingModel.getAllMatches.mockReturnValue([{ volunteerId: 1, eventId: 101 }]);
        getAllVolunteerMatches(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true, data: expect.any(Array) })
        );
    });

    // ---------- getMatchesForVolunteer ----------
    test("should get matches for a specific volunteer", () => {
        req.params.volunteerId = 1;
        matchingModel.getMatchesByVolunteer.mockReturnValue([{ volunteerId: 1 }]);
        getMatchesForVolunteer(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true, data: expect.any(Array) })
        );
    });

    // ---------- deleteVolunteerMatch ----------
    test("should return 400 if volunteerId or eventId missing on delete", () => {
        req.body = { volunteerId: 1 }; // missing eventId
        deleteVolunteerMatch(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return 404 if match not found", () => {
        req.body = { volunteerId: 1, eventId: 999 };
        matchingModel.deleteMatch.mockReturnValue(false);
        deleteVolunteerMatch(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should delete match and update history", () => {
        req.body = { volunteerId: 1, eventId: 101 };
        matchingModel.deleteMatch.mockReturnValue(true);
        historyModel.deleteHistoryByEvent.mockReturnValue(true);
        deleteVolunteerMatch(req, res);
        expect(matchingModel.deleteMatch).toHaveBeenCalled();
        expect(historyModel.deleteHistoryByEvent).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
