const { 
    verifyToken, 
    mockAuth, 
    requireRole,
    requireAdmin,
    requireVolunteerOrAdmin 
} = require("../../src/middleware/authMiddleware");

describe("authMiddleware", () => {
    const mockReq = (headers = {}, user = null) => ({ headers, user });
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };
    const mockNext = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("verifyToken", () => {
        test("should pass when user already set", async () => {
            const req = mockReq({}, { id: 1, email: 'test@test.com', role: 'volunteer' });
            const res = mockRes();
            
            await verifyToken(req, res, mockNext);
            
            expect(mockNext).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test("should return 401 when no authorization header", async () => {
            const req = mockReq();
            const res = mockRes();
            
            await verifyToken(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'No authorization header'
                })
            );
            expect(mockNext).not.toHaveBeenCalled();
        });

        test("should return 401 for invalid token", async () => {
            const req = mockReq({ authorization: "Bearer invalid" });
            const res = mockRes();
            
            await verifyToken(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Invalid token'
                })
            );
        });

        test("should return 401 for empty token", async () => {
            const req = mockReq({ authorization: "Bearer " });
            const res = mockRes();
            
            await verifyToken(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(401);
        });

        test("should return 401 for short token", async () => {
            const req = mockReq({ authorization: "Bearer abc" });
            const res = mockRes();
            
            await verifyToken(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(401);
        });

        test("should accept valid token and set req.user", async () => {
            const req = mockReq({ authorization: "Bearer validtoken1234567890" });
            const res = mockRes();
            
            await verifyToken(req, res, mockNext);
            
            expect(req.user).toBeDefined();
            expect(req.user).toHaveProperty('id');
            expect(req.user).toHaveProperty('email');
            expect(req.user).toHaveProperty('role');
            expect(mockNext).toHaveBeenCalled();
        });

        test("should handle errors gracefully", async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const req = mockReq({ authorization: "Bearer validtoken123" });
            const res = mockRes();
            
            // Force an error
            req.headers.authorization = {
                replace: () => {
                    throw new Error('Mock error');
                }
            };
            
            await verifyToken(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Authentication failed'
                })
            );
            
            consoleSpy.mockRestore();
        });

        test("should handle missing Bearer prefix", async () => {
            const req = mockReq({ authorization: "validtoken123" });
            const res = mockRes();
            
            await verifyToken(req, res, mockNext);
            
            // Should still work or reject appropriately
            expect(res.status).toHaveBeenCalled();
        });
    });

    describe("mockAuth", () => {
        test("should set default admin user", () => {
            const req = {};
            const res = mockRes();
            
            mockAuth(req, res, mockNext);
            
            expect(req.user).toHaveProperty("role", "admin");
            expect(req.user).toHaveProperty("id", 99);
            expect(req.user).toHaveProperty("email", "admin@test.com");
            expect(mockNext).toHaveBeenCalled();
        });

        test("should always set same mock user", () => {
            const req1 = {};
            const req2 = {};
            
            mockAuth(req1, mockRes(), mockNext);
            mockAuth(req2, mockRes(), mockNext);
            
            expect(req1.user).toEqual(req2.user);
        });
    });

    describe("requireRole", () => {
        test("should allow access for matching role", () => {
            const middleware = requireRole(['admin']);
            const req = mockReq({}, { id: 1, email: 'admin@test.com', role: 'admin' });
            const res = mockRes();
            
            middleware(req, res, mockNext);
            
            expect(mockNext).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test("should allow access for any matching role in array", () => {
            const middleware = requireRole(['admin', 'volunteer']);
            const req = mockReq({}, { id: 1, email: 'vol@test.com', role: 'volunteer' });
            const res = mockRes();
            
            middleware(req, res, mockNext);
            
            expect(mockNext).toHaveBeenCalled();
        });

        test("should deny access for wrong role", () => {
            const middleware = requireRole(['admin']);
            const req = mockReq({}, { id: 1, email: 'vol@test.com', role: 'volunteer' });
            const res = mockRes();
            
            middleware(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Access denied',
                    userRole: 'volunteer',
                    requiredRoles: ['admin']
                })
            );
            expect(mockNext).not.toHaveBeenCalled();
        });

        test("should return 401 when no user authenticated", () => {
            const middleware = requireRole(['admin']);
            const req = mockReq();
            const res = mockRes();
            
            middleware(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'User not authenticated'
                })
            );
        });

        test("should handle errors in role checking", () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const middleware = requireRole(['admin']);
            const req = mockReq({}, { role: 'admin' });
            const res = mockRes();
            
            // Force an error
            req.user.role = {
                includes: () => {
                    throw new Error('Mock error');
                }
            };
            
            middleware(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Server error'
                })
            );
            
            consoleSpy.mockRestore();
        });

        test("should work with single role", () => {
            const middleware = requireRole(['volunteer']);
            const req = mockReq({}, { id: 1, role: 'volunteer' });
            const res = mockRes();
            
            middleware(req, res, mockNext);
            
            expect(mockNext).toHaveBeenCalled();
        });

        test("should work with multiple roles", () => {
            const middleware = requireRole(['admin', 'employee', 'volunteer']);
            const req = mockReq({}, { id: 1, role: 'employee' });
            const res = mockRes();
            
            middleware(req, res, mockNext);
            
            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe("requireAdmin", () => {
        test("should allow admin users", () => {
            const req = mockReq({}, { id: 1, email: 'admin@test.com', role: 'admin' });
            const res = mockRes();
            
            requireAdmin(req, res, mockNext);
            
            expect(mockNext).toHaveBeenCalled();
        });

        test("should block non-admin users", () => {
            const req = mockReq({}, { id: 2, email: 'vol@test.com', role: 'volunteer' });
            const res = mockRes();
            
            requireAdmin(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(403);
            expect(mockNext).not.toHaveBeenCalled();
        });

        test("should block employee users", () => {
            const req = mockReq({}, { id: 3, role: 'employee' });
            const res = mockRes();
            
            requireAdmin(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe("requireVolunteerOrAdmin", () => {
        test("should allow volunteer users", () => {
            const req = mockReq({}, { id: 1, role: 'volunteer' });
            const res = mockRes();
            
            requireVolunteerOrAdmin(req, res, mockNext);
            
            expect(mockNext).toHaveBeenCalled();
        });

        test("should allow admin users", () => {
            const req = mockReq({}, { id: 1, role: 'admin' });
            const res = mockRes();
            
            requireVolunteerOrAdmin(req, res, mockNext);
            
            expect(mockNext).toHaveBeenCalled();
        });

        test("should block employee users", () => {
            const req = mockReq({}, { id: 1, role: 'employee' });
            const res = mockRes();
            
            requireVolunteerOrAdmin(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(403);
        });

        test("should block unauthenticated users", () => {
            const req = mockReq();
            const res = mockRes();
            
            requireVolunteerOrAdmin(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(401);
        });
    });
});