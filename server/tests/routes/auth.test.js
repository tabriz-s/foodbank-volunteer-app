const express = require("express");
const request = require("supertest");
const authRoutes = require("../../src/routes/auth");
const authController = require("../../src/controllers/authController");
const { verifyToken, mockAuth } = require("../../src/middleware/authMiddleware");

// Mock all middleware and controller functions
jest.mock("../../src/controllers/authController");
jest.mock("../../src/middleware/authMiddleware", () => ({
    verifyToken: jest.fn((req, res, next) => {
        req.user = { id: 1, role: "volunteer", email: "mock@test.com" };
        next();
    }),
    mockAuth: jest.fn((req, res, next) => {
        req.user = { id: 99, role: "admin", email: "admin@test.com" };
        next();
    }),
}));

describe("Auth Routes", () => {
    let app;
    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use("/api/auth", authRoutes);
    });

    beforeEach(() => jest.clearAllMocks());

    // 🔹 POST /register
    test("POST /register should call register controller", async () => {
        authController.register.mockImplementation((req, res) =>
            res.status(201).json({ success: true, message: "User registered" })
        );
        const res = await request(app)
            .post("/api/auth/register")
            .send({ email: "new@test.com", password: "123456" });
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
    });

    // 🔹 POST /login
    test("POST /login should call login controller", async () => {
        authController.login.mockImplementation((req, res) =>
            res.status(200).json({ success: true, token: "mocktoken" })
        );
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "user@test.com", password: "123456" });
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBe("mocktoken");
    });

    // 🔹 POST /logout
    test("POST /logout should call logout controller with verifyToken", async () => {
        authController.logout.mockImplementation((req, res) =>
            res.status(200).json({ success: true, message: "Logged out" })
        );
        const res = await request(app).post("/api/auth/logout");
        expect(verifyToken).toHaveBeenCalled();
        expect(res.body.success).toBe(true);
    });

    // 🔹 POST /verify
    test("POST /verify should call verifyUser controller", async () => {
        authController.verifyUser = jest.fn((req, res) =>
            res.status(200).json({ success: true, user: { id: 1 } })
        );
        const res = await request(app).post("/api/auth/verify");
        expect(res.statusCode).toBe(200);
        expect(res.body.user).toBeDefined();
    });

    // 🔹 GET /me (protected)
    test("GET /me should call getCurrentUser controller", async () => {
        authController.getCurrentUser = jest.fn((req, res) =>
            res.status(200).json({ success: true, user: req.user })
        );
        const res = await request(app).get("/api/auth/me");
        expect(res.statusCode).toBe(200);
        expect(res.body.user.email).toBe("mock@test.com");
    });

    // 🔹 POST /refresh
    test("POST /refresh should call refreshToken controller", async () => {
        authController.refreshToken = jest.fn((req, res) =>
            res.status(200).json({ success: true, token: "refreshedtoken" })
        );
        const res = await request(app).post("/api/auth/refresh");
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBe("refreshedtoken");
    });

    // 🔹 GET /me (mockAuth)
    test("GET /me (mockAuth) should return mock user", async () => {
        const res = await request(app).get("/api/auth/me");
        expect(mockAuth).toHaveBeenCalled();
        expect(res.statusCode).toBe(200);
        expect(res.body.user.role).toBe("admin");
    });
});
