const express = require("express");
const request = require("supertest");

// ✅ Ensure correct path
const volunteersRouter = require("../../src/routes/volunteers");

// Mock controller functions directly
jest.mock("../../src/controllers/ProfileController", () => ({
    getAllVolunteers: jest.fn((req, res) =>
        res.status(200).json({ success: true, data: [{ id: 1, name: "John Doe" }] })
    ),
    getProfile: jest.fn((req, res) => {
        if (req.query.user_id === "404")
            return res.status(404).json({ success: false });
        res.status(200).json({ success: true, data: { User_id: 1 } });
    }),
    createProfile: jest.fn((req, res) => {
        if (!req.body.full_name)
            return res.status(400).json({ success: false, message: "Invalid" });
        res.status(201).json({ success: true, data: req.body });
    }),
    updateProfile: jest.fn((req, res) => {
        if (req.query.user_id === "404")
            return res.status(404).json({ success: false });
        res.status(200).json({ success: true, data: req.body });
    }),
    deleteVolunteer: jest.fn((req, res) => {
        if (req.params.id === "404")
            return res.status(404).json({ success: false });
        res.status(200).json({ success: true });
    }),
}));

jest.mock("../../src/middleware/Validation", () => ({
    validateProfile: (req, res, next) => next(),
}));

describe("Volunteers Router", () => {
    let app;
    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use("/api/volunteers", volunteersRouter);
    });

    test("GET /api/volunteers returns all volunteers", async () => {
        const res = await request(app).get("/api/volunteers");
        expect(res.status).toBe(200);
        expect(res.body.data[0].name).toBe("John Doe");
    });

    test("GET /api/volunteers/profile returns valid profile", async () => {
        const res = await request(app).get("/api/volunteers/profile?user_id=1");
        expect(res.status).toBe(200);
        expect(res.body.data.User_id).toBe(1);
    });

    test("GET /api/volunteers/profile returns 404 if not found", async () => {
        const res = await request(app).get("/api/volunteers/profile?user_id=404");
        expect(res.status).toBe(404);
    });

    test("POST /api/volunteers/profile creates new profile", async () => {
        const res = await request(app)
            .post("/api/volunteers/profile")
            .send({ user_id: 3, full_name: "New User" });
        expect(res.status).toBe(201);
    });

    test("POST /api/volunteers/profile returns 400 for invalid", async () => {
        const res = await request(app).post("/api/volunteers/profile").send({});
        expect(res.status).toBe(400);
    });

    test("PUT /api/volunteers/profile updates profile", async () => {
        const res = await request(app)
            .put("/api/volunteers/profile?user_id=1")
            .send({ full_name: "Updated" });
        expect(res.status).toBe(200);
    });

    test("PUT /api/volunteers/profile returns 404 for missing user", async () => {
        const res = await request(app)
            .put("/api/volunteers/profile?user_id=404")
            .send({ full_name: "Missing" });
        expect(res.status).toBe(404);
    });

    test("DELETE /api/volunteers/:id removes volunteer", async () => {
        const res = await request(app).delete("/api/volunteers/1");
        expect(res.status).toBe(200);
    });

    test("DELETE /api/volunteers/:id returns 404 if missing", async () => {
        const res = await request(app).delete("/api/volunteers/404");
        expect(res.status).toBe(404);
    });
});
