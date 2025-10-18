const {
    getVolunteerHistory,
    addVolunteerHistory,
    updateHistoryByEvent,
    deleteHistoryByEvent,
} = require("../src/models/VolunteerHistoryModel");

describe("VolunteerHistoryModel", () => {
    beforeEach(() => {
        // Each test starts with a clean slate by deep-copying initial data if needed
    });

    // -------------------------------------------------------------------------
    // 🔹 Basic Retrieval
    // -------------------------------------------------------------------------
    test("should return correct history for an existing volunteer", () => {
        const history = getVolunteerHistory(1);
        expect(history).toBeInstanceOf(Array);
        expect(history.length).toBeGreaterThan(0);
        expect(history[0]).toHaveProperty("eventId");
    });

    test("should return an empty array if volunteerId not found", () => {
        const history = getVolunteerHistory(5000);
        expect(history).toEqual([]);
    });

    // -------------------------------------------------------------------------
    // 🔹 Add Function
    // -------------------------------------------------------------------------
    test("should add a new history entry for a volunteer", () => {
        const newEvent = {
            id: 999,
            name: "Beach Cleanup",
            location: "Galveston",
            date: "2025-10-17",
            skills: ["Teamwork"],
            urgency: "High",
        };

        const result = addVolunteerHistory(1, newEvent);
        expect(result).toHaveProperty("status", "Pending");

        const updatedHistory = getVolunteerHistory(1);
        expect(updatedHistory.find((e) => e.eventId === 999)).toBeTruthy();
    });

    test("should create a new history list for a new volunteer", () => {
        const event = {
            id: 777,
            name: "New User Event",
            location: "Downtown",
            date: "2025-10-21",
            urgency: "Medium",
        };
        const result = addVolunteerHistory(99, event);
        expect(result).toHaveProperty("eventId", 777);
        expect(getVolunteerHistory(99).length).toBe(1);
    });

    test("should handle adding a history entry with no skills array", () => {
        const newEvent = {
            id: 555,
            name: "Simple Task",
            location: "Test Location",
            date: "2025-10-20",
            urgency: "Low",
        };
        const result = addVolunteerHistory(1, newEvent);
        expect(result.skills).toEqual([]);
    });

    // -------------------------------------------------------------------------
    // 🔹 Update Function
    // -------------------------------------------------------------------------
    test("should update matching event correctly", () => {
        const updatedCount = updateHistoryByEvent(101, { urgency: "Critical" });
        expect(updatedCount).toBeGreaterThan(0);

        const updated = getVolunteerHistory(1).find((e) => e.eventId === 101);
        expect(updated.urgency).toBe("Critical");
    });

    test("should skip update if eventId does not match any entries", () => {
        const updatedCount = updateHistoryByEvent(9999, { urgency: "Low" });
        expect(updatedCount).toBe(0);
    });

    // -------------------------------------------------------------------------
    // 🔹 Delete Function
    // -------------------------------------------------------------------------
    test("should delete event history when event is removed", () => {
        deleteHistoryByEvent(102);
        const remaining = getVolunteerHistory(1);
        expect(remaining.find((e) => e.eventId === 102)).toBeUndefined();
    });

    test("should not delete anything if eventId not found", () => {
        const before = getVolunteerHistory(1).length;
        const deleted = deleteHistoryByEvent(9999);
        const after = getVolunteerHistory(1).length;
        expect(deleted).toBe(0);
        expect(after).toBe(before);
    });
});
