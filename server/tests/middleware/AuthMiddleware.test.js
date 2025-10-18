const { verifyToken, mockAuth } = require("../../src/middleware/authMiddleware");

describe("authMiddleware", () => {
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    test("mockAuth sets default admin user", () => {
        const req = {};
        const res = mockRes();
        const next = jest.fn();
        mockAuth(req, res, next);
        expect(req.user).toHaveProperty("role", "admin");
        expect(next).toHaveBeenCalled();
    });

    test("verifyToken rejects invalid tokens", async () => {
        const req = { headers: { authorization: "Bearer invalid" } };
        const res = mockRes();
        const next = jest.fn();
        await verifyToken(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });
});
