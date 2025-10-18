const request = require("supertest");
const express = require("express");
const authRoutes = require("../../src/routes/auth");

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Auth Routes", () => {
    test("POST /register returns success", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ email: "user@test.com", password: "123456" });
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
    });

    test("POST /login returns token", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "user@test.com", password: "123456" });
        expect(res.body).toHaveProperty("token");
    });
});
