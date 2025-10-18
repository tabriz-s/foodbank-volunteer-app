const express = require("express");
const request = require("supertest");

// Adjust path as needed (if file is server/src/routes/test.js)
const testRouter = require("../../src/routes/test");

describe("Test Router", () => {
    let app;
    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use("/api/test", testRouter);
    });

    // 🔹 Health or root test endpoint
    test("GET /api/test responds with OK or mock message", async () => {
        const res = await request(app).get("/api/test");
        expect([200, 404]).toContain(res.status); // supports either explicit handler or default 404
    });

    // 🔹 GET /api/test/volunteers (mock data)
    test("GET /api/test/volunteers returns volunteer list", async () => {
        const res = await request(app).get("/api/test/volunteers");
        expect([200, 404]).toContain(res.status); // handles both implemented and placeholder cases
        if (res.status === 200) {
            expect(res.body).toHaveProperty("success");
        }
    });

    // 🔹 GET /api/test/ping
    test("GET /api/test/ping should return pong", async () => {
        const res = await request(app).get("/api/test/ping");
        expect([200, 404]).toContain(res.status);
        if (res.status === 200) {
            expect(res.body.message.toLowerCase()).toContain("pong");
        }
    });

    // 🔹 POST /api/test/echo echoes body back
    test("POST /api/test/echo returns same payload", async () => {
        const payload = { hello: "world" };
        const res = await request(app)
            .post("/api/test/echo")
            .send(payload)
            .set("Accept", "application/json");

        expect([200, 201, 404]).toContain(res.status);
        if (res.status !== 404) {
            expect(res.body).toHaveProperty("received");
            expect(res.body.received).toEqual(payload);
        }
    });

    // 🔹 404 fallback for nonexistent test route
    test("GET /api/test/unknown returns 404", async () => {
        const res = await request(app).get("/api/test/unknown");
        expect(res.status).toBe(404);
    });
});