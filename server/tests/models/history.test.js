const request = require("supertest");
const express = require("express");
const historyRoutes = require("../../src/routes/history");
const { mockAuth } = require("../../src/middleware/AuthMiddleware");

jest.mock("../../src/middleware/AuthMiddleware", () => ({
    mockAuth: jest.fn((req, res, next) => {
        req.user = { id: 1, role: "admin" };
        next();
    }),
}));

jest.mock("../../src/controllers/HistoryController", () => ({
    getVolunteerHistoryById: jest.fn((req, res) =>
        res.status(200).json({ success: true, route: "getVolunteerHistoryById" })
    ),
    assignVolunteerToEvent: jest.fn((req, res) =>
        res.status(201).json({ success: true, route: "assignVolunteerToEvent" })
    ),
    updateEventHistory: jest.fn((req, res) =>
        res.status(200).json({ success: true, route: "updateEventHistory" })
    ),
    deleteEventHistory: jest.fn((req, res) =>
        res.status(200).json({ success: true, route: "deleteEventHistory" })
    ),
}));

const app = express();
app.use(express.json());
app.use("/api", historyRoutes);

describe("History Routes", () => {
    test("GET /volunteers/:id/history calls getVolunteerHistoryById", async () => {
        const res = await request(app).get("/api/volunteers/1/history");
        expect(res.statusCode).toBe(200);
        expect(res.body.route).toBe("getVolunteerHistoryById");
    });

    test("POST /volunteers/:id/history calls assignVolunteerToEvent", async () => {
        const res = await request(app)
            .post("/api/volunteers/1/history")
            .send({ id: 123 });
        expect(res.statusCode).toBe(201);
        expect(res.body.route).toBe("assignVolunteerToEvent");
    });

    test("PUT /events/:eventId/history calls updateEventHistory", async () => {
        const res = await request(app)
            .put("/api/events/5/history")
            .send({ name: "Updated" });
        expect(res.statusCode).toBe(200);
        expect(res.body.route).toBe("updateEventHistory");
    });

    test("DELETE /events/:eventId/history calls deleteEventHistory", async () => {
        const res = await request(app).delete("/api/events/5/history");
        expect(res.statusCode).toBe(200);
        expect(res.body.route).toBe("deleteEventHistory");
    });
});
