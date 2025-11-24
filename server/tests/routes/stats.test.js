// stats.test.js
const request = require("supertest");
const express = require("express");

// Import the router we are testing
const statsRouter = require("../../src/routes/stats");

// Mock the database module
jest.mock("../../src/config/database", () => ({
    getConnection: jest.fn(),
}));

const { getConnection } = require("../../src/config/database");

describe("GET /api/stats", () => {
    let app;

    beforeAll(() => {
        // Create a minimal express app that uses the stats router
        app = express();
        app.use("/api/stats", statsRouter);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("returns correct stats when DB queries succeed", async () => {
        // Mock the pool + query behavior
        const mockQuery = jest.fn();

        // Simulated query results (in MySQL2 format)
        mockQuery
            .mockResolvedValueOnce([[{ count: 10 }]]) // volunteers
            .mockResolvedValueOnce([[{ count: 3 }]])  // active events
            .mockResolvedValueOnce([[{ count: 20 }]]) // attended participations
            .mockResolvedValueOnce([[{ count: 5 }]]); // distinct locations

        getConnection.mockResolvedValue({
            query: mockQuery,
        });

        const response = await request(app).get("/api/stats");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            totalVolunteers: 10,
            activeEvents: 3,
            mealsServed: 20 * 50, // 1000
            organizationsHelped: 5,
        });

        expect(mockQuery).toHaveBeenCalledTimes(4);
    });

    test("handles database errors and returns 500", async () => {
        getConnection.mockRejectedValue(new Error("DB connection failed"));

        const response = await request(app).get("/api/stats");

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Failed to fetch statistics");
    });
});
