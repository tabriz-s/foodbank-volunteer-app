const request = require("supertest");
const express = require("express");
const testRoutes = require("../../src/routes/test");

const app = express();
app.use(express.json());
app.use("/api/test", testRoutes);

describe("Test Routes", () => {
    test("GET /volunteers returns mock data", async () => {
        const res = await request(app).get("/api/test/volunteers");
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test("POST /echo echoes request body", async () => {
        const res = await request(app)
            .post("/api/test/echo")
            .send({ hello: "world" });
        expect(res.body.received).toEqual({ hello: "world" });
    });
});
