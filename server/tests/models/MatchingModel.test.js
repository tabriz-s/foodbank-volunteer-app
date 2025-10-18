const {
    addMatch,
    getAllMatches,
    getMatchesByVolunteer,
    deleteMatch,
} = require("../../src/models/VolunteerMatchingModel");

describe("VolunteerMatchingModel", () => {
    beforeEach(() => {
        // reset module between tests
        jest.resetModules();
    });

    test("should add a new match and return correct object", () => {
        const match = addMatch(1, 101);
        expect(match).toHaveProperty("volunteerId", 1);
        expect(match).toHaveProperty("eventId", 101);
        expect(match).toHaveProperty("dateMatched");
    });

    test("should return all matches", () => {
        addMatch(1, 101);
        addMatch(2, 102);
        const matches = getAllMatches();
        expect(matches.length).toBeGreaterThanOrEqual(2);
    });

    test("should get matches by volunteer id", () => {
        addMatch(1, 101);
        addMatch(1, 102);
        addMatch(2, 103);
        const matches = getMatchesByVolunteer(1);
        expect(matches.every(m => m.volunteerId === 1)).toBe(true);
    });

    test("should delete a specific match and return true", () => {
        addMatch(1, 201);
        const result = deleteMatch(1, 201);
        expect(result).toBe(true);
    });

    test("should return false when deleting non-existent match", () => {
        const result = deleteMatch(999, 888);
        expect(result).toBe(false);
    });
});
