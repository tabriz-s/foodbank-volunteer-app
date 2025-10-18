const { requireAdmin } = require("../../src/middleware/RoleMiddleware");

describe("RoleMiddleware - requireAdmin", () => {
    let req, res, next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    test("should allow access for admin users", () => {
        req.user = { id: 99, role: "admin" };
        requireAdmin(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test("should deny access for missing user", () => {
        req.user = null;
        requireAdmin(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: "Access denied: admin privileges required.",
            })
        );
    });

    test("should deny access for non-admin user", () => {
        req.user = { id: 1, role: "volunteer" };
        requireAdmin(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
    });
});
