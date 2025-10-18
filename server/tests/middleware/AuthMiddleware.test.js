const { mockAuth } = require("../../src/middleware/AuthMiddleware");

describe("AuthMiddleware - mockAuth", () => {
    let req, res, next;

    beforeEach(() => {
        req = { headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    test("should assign default admin user when no authorization header", () => {
        mockAuth(req, res, next);
        expect(req.user).toEqual({ id: 99, role: "admin" });
        expect(next).toHaveBeenCalled();
    });

    test("should decode valid base64 JSON token", () => {
        const user = { id: 1, role: "volunteer" };
        const token = Buffer.from(JSON.stringify(user)).toString("base64");
        req.headers.authorization = `Bearer ${token}`;

        mockAuth(req, res, next);
        expect(req.user).toEqual(user);
        expect(next).toHaveBeenCalled();
    });

    test("should handle invalid token format", () => {
        req.headers.authorization = "Bearer invalid-token";
        mockAuth(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: "Unauthorized: invalid token",
            })
        );
    });
});
