const request = require("supertest");
const express = require("express");
const authRoutes = require("../../src/routes/auth");

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Auth Routes", () => {
    test("POST /register should respond with placeholder message", async () => {
        const res = await request(app).post("/api/auth/register").send({});
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("coming soon");
    });

    test("POST /login should respond with placeholder message", async () => {
        const res = await request(app).post("/api/auth/login").send({});
        expect(res.statusCode).toBe(200);
    });

    test("GET /me should return mock user", async () => {
        const res = await request(app).get("/api/auth/me");
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.user).toBeDefined();
    });
});
