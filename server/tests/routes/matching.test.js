const request = require("supertest");
const express = require("express");
const matchingRoutes = require("../../src/routes/matching");

const controller = require("../../src/controllers/VolunteerMatchingController");
jest.mock("../../src/controllers/VolunteerMatchingController");

const { mockAuth } = require("../../src/middleware/AuthMiddleware");
const { requireAdmin } = require("../../src/middleware/RoleMiddleware");

jest.mock("../../src/middleware/AuthMiddleware", () => ({
    mockAuth: jest.fn((req, res, next) => {
        req.user = { id: 1, role: "admin" };
        next();
    }),
}));

jest.mock("../../src/middleware/RoleMiddleware", () => ({
    requireAdmin: jest.fn((req, res, next) => next()),
}));

const app = express();
app.use(express.json());
app.use("/api", matchingRoutes);

describe("Matching Routes", () => {
    test("POST /matching calls createMatch", async () => {
        controller.createMatch.mockImplementation((req, res) =>
            res.status(201).json({ route: "createMatch" })
        );
        const res = await request(app)
            .post("/api/matching")
            .send({ volunteerId: 1, eventId: 101 });
        expect(res.statusCode).toBe(201);
        expect(res.body.route).toBe("createMatch");
    });

    test("GET /matching calls getAllVolunteerMatches", async () => {
        controller.getAllVolunteerMatches.mockImplementation((req, res) =>
            res.status(200).json({ route: "getAllVolunteerMatches" })
        );
        const res = await request(app).get("/api/matching");
        expect(res.statusCode).toBe(200);
    });

    test("GET /matching/:volunteerId calls getMatchesForVolunteer", async () => {
        controller.getMatchesForVolunteer.mockImplementation((req, res) =>
            res.status(200).json({ route: "getMatchesForVolunteer" })
        );
        const res = await request(app).get("/api/matching/1");
        expect(res.statusCode).toBe(200);
    });

    test("DELETE /matching calls deleteVolunteerMatch", async () => {
        controller.deleteVolunteerMatch.mockImplementation((req, res) =>
            res.status(200).json({ route: "deleteVolunteerMatch" })
        );
        const res = await request(app)
            .delete("/api/matching")
            .send({ volunteerId: 1, eventId: 101 });
        expect(res.statusCode).toBe(200);
    });
});
