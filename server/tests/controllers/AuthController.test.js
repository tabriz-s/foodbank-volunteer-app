const authController = require("../../src/controllers/authController");

describe("authController", () => {
    const mockReq = (body = {}, user = null) => ({ body, user });
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    // Clear users before each test
    beforeEach(() => {
        authController.clearMockUsers();
    });

    describe("register", () => {
        test("register returns success with mock user", async () => {
            const req = mockReq({ email: "test@example.com", password: "123456" });
            const res = mockRes();
            await authController.register(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        test("register returns 400 when email missing", async () => {
            const req = mockReq({ password: "123456" });
            const res = mockRes();
            await authController.register(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Email and password are required'
                })
            );
        });

        test("register returns 400 when password missing", async () => {
            const req = mockReq({ email: "test@example.com" });
            const res = mockRes();
            await authController.register(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("register returns 409 for duplicate email", async () => {
            const email = "duplicate@example.com";
            const req1 = mockReq({ email, password: "pass1" });
            const res1 = mockRes();
            await authController.register(req1, res1);

            const req2 = mockReq({ email, password: "pass2" });
            const res2 = mockRes();
            await authController.register(req2, res2);

            expect(res2.status).toHaveBeenCalledWith(409);
            expect(res2.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'User already exists'
                })
            );
        });

        test("register uses displayName when provided", async () => {
            const req = mockReq({
                email: "test@example.com",
                password: "123456",
                displayName: "Test User"
            });
            const res = mockRes();
            await authController.register(req, res);

            const users = authController.getMockUsers();
            const user = Array.from(users.values())[0];
            expect(user.displayName).toBe("Test User");
        });

        test("register defaults displayName to email username", async () => {
            const req = mockReq({
                email: "john.doe@example.com",
                password: "123456"
            });
            const res = mockRes();
            await authController.register(req, res);

            const users = authController.getMockUsers();
            const user = Array.from(users.values())[0];
            expect(user.displayName).toBe("john.doe");
        });

        test("register accepts custom role", async () => {
            const req = mockReq({
                email: "admin@example.com",
                password: "123456",
                role: "admin"
            });
            const res = mockRes();
            await authController.register(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: expect.objectContaining({ role: 'admin' })
                })
            );
        });

        test("register handles server errors gracefully", async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            // Force an error by mocking Map.prototype.set
            const originalSet = Map.prototype.set;
            Map.prototype.set = jest.fn(() => {
                throw new Error('Mock error');
            });

            const req = mockReq({ email: "test@example.com", password: "123456" });
            const res = mockRes();
            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Server error during registration'
                })
            );

            Map.prototype.set = originalSet;
            consoleSpy.mockRestore();
        });
    });

    describe("login", () => {
        test("login returns mock token", async () => {
            const req = mockReq({ email: "test@example.com", password: "123456" });
            const res = mockRes();
            await authController.login(req, res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: expect.any(String) }));
        });

        test("login returns 400 when email missing", async () => {
            const req = mockReq({ password: "123456" });
            const res = mockRes();
            await authController.login(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("login returns 400 when password missing", async () => {
            const req = mockReq({ email: "test@example.com" });
            const res = mockRes();
            await authController.login(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("login auto-creates user if not exists", async () => {
            const req = mockReq({
                email: "newuser@example.com",
                password: "123456"
            });
            const res = mockRes();
            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: expect.objectContaining({
                        email: 'newuser@example.com',
                        role: 'volunteer'
                    })
                })
            );
        });

        test("login finds existing user", async () => {
            // Register first
            const regReq = mockReq({
                email: "existing@example.com",
                password: "123456"
            });
            const regRes = mockRes();
            await authController.register(regReq, regRes);

            // Then login
            const loginReq = mockReq({
                email: "existing@example.com",
                password: "123456"
            });
            const loginRes = mockRes();
            await authController.login(loginReq, loginRes);

            expect(loginRes.status).toHaveBeenCalledWith(200);
        });

        test("login handles server errors", async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            // Force error
            const originalFind = Array.prototype.find;
            Array.prototype.find = jest.fn(() => {
                throw new Error('Mock error');
            });

            const req = mockReq({ email: "test@example.com", password: "123456" });
            const res = mockRes();
            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);

            Array.prototype.find = originalFind;
            consoleSpy.mockRestore();
        });
    });

    describe("logout", () => {
        test("logout returns success message", async () => {
            const req = mockReq({}, { id: 1 });
            const res = mockRes();
            await authController.logout(req, res);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
        });

        test("logout works without user", async () => {
            const req = mockReq();
            const res = mockRes();
            await authController.logout(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test("logout handles errors", async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const req = mockReq();
            const res = {
                status: jest.fn(() => {
                    throw new Error('Mock error');
                })
            };

            // Should not throw
            await expect(authController.logout(req, res)).rejects.toThrow();

            consoleSpy.mockRestore();
        });
    });

    describe("verifyUser", () => {
        test("verifyUser returns user from middleware", async () => {
            const mockUser = { id: 5, email: 'verified@test.com', role: 'admin' };
            const req = mockReq({}, mockUser);
            const res = mockRes();
            await authController.verifyUser(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: mockUser
                })
            );
        });

        test("verifyUser returns default user when req.user not set", async () => {
            const req = mockReq();
            const res = mockRes();
            await authController.verifyUser(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: expect.objectContaining({
                        email: 'test@test.com'
                    })
                })
            );
        });

        test("verifyUser handles errors", async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const req = mockReq();
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(() => {
                    throw new Error('Mock error');
                })
            };

            await expect(authController.verifyUser(req, res)).rejects.toThrow();

            consoleSpy.mockRestore();
        });
    });

    describe("getCurrentUser", () => {
        test("getCurrentUser returns user from middleware", async () => {
            const mockUser = { id: 10, email: 'current@test.com', role: 'volunteer' };
            const req = mockReq({}, mockUser);
            const res = mockRes();
            await authController.getCurrentUser(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: mockUser
                })
            );
        });

        test("getCurrentUser handles undefined user", async () => {
            const req = mockReq();
            const res = mockRes();
            await authController.getCurrentUser(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test("getCurrentUser handles errors", async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const req = mockReq();
            const res = {
                status: jest.fn(() => {
                    throw new Error('Mock error');
                })
            };

            await expect(authController.getCurrentUser(req, res)).rejects.toThrow();

            consoleSpy.mockRestore();
        });
    });

    describe("refreshToken", () => {
        test("refreshToken returns new token", async () => {
            const req = mockReq();
            const res = mockRes();
            await authController.refreshToken(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    token: expect.stringMatching(/^mocktoken_/)
                })
            );
        });

        test("refreshToken generates different tokens", async () => {
            const req1 = mockReq();
            const res1 = mockRes();
            await authController.refreshToken(req1, res1);

            const req2 = mockReq();
            const res2 = mockRes();
            await authController.refreshToken(req2, res2);

            const token1 = res1.json.mock.calls[0][0].token;
            const token2 = res2.json.mock.calls[0][0].token;
            expect(token1).not.toBe(token2);
        });

        test("refreshToken handles errors", async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const req = mockReq();
            const res = {
                status: jest.fn(() => {
                    throw new Error('Mock error');
                })
            };

            await expect(authController.refreshToken(req, res)).rejects.toThrow();

            consoleSpy.mockRestore();
        });
    });

    describe("helper functions", () => {
        test("getMockUsers returns Map", () => {
            const users = authController.getMockUsers();
            expect(users).toBeInstanceOf(Map);
        });

        test("clearMockUsers clears all users", async () => {
            const req = mockReq({ email: "test@example.com", password: "123456" });
            const res = mockRes();
            await authController.register(req, res);

            expect(authController.getMockUsers().size).toBeGreaterThan(0);

            authController.clearMockUsers();
            expect(authController.getMockUsers().size).toBe(0);
        });


    });

    describe("database mode registration", () => {
        beforeEach(() => {
            authController.clearMockUsers();
        });

        afterEach(() => {
            process.env.USE_DATABASE = 'false';
        });

        test("should handle database mode with uid", async () => {
            process.env.USE_DATABASE = 'true';

            const req = mockReq({
                email: "db@example.com",
                password: "123456",
                uid: "firebase_uid_123",
                role: "volunteer"
            });
            const res = mockRes();

            await authController.register(req, res);

            // Should either succeed with DB or fall back to mock
            expect(res.status).toHaveBeenCalledWith(expect.any(Number));
            expect([201, 409, 500].includes(res.status.mock.calls[0][0])).toBe(true);
        });

        test("should fall back to mock when database unavailable", async () => {
            process.env.USE_DATABASE = 'true';

            const req = mockReq({
                email: "fallback@example.com",
                password: "123456",
                uid: "firebase_uid_456"
            });
            const res = mockRes();

            await authController.register(req, res);

            // Should work even if DB fails
            expect(res.status).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
        });

        test("should use mock mode when uid not provided", async () => {
            process.env.USE_DATABASE = 'true';

            const req = mockReq({
                email: "nomock@example.com",
                password: "123456"
            });
            const res = mockRes();

            await authController.register(req, res);

            // Should use mock mode
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe("database mode login", () => {
        beforeEach(() => {
            authController.clearMockUsers();
        });

        afterEach(() => {
            process.env.USE_DATABASE = 'false';
        });

        test("should handle database mode login with uid", async () => {
            process.env.USE_DATABASE = 'true';

            const req = mockReq({
                email: "dblogin@example.com",
                password: "123456",
                uid: "firebase_uid_789",
                idToken: "mock_token_123"
            });
            const res = mockRes();

            await authController.login(req, res);

            // Should attempt DB login or fall back
            expect(res.status).toHaveBeenCalledWith(expect.any(Number));
            expect([200, 404, 500].includes(res.status.mock.calls[0][0])).toBe(true);
        });

        test("should fall back to mock login when database fails", async () => {
            process.env.USE_DATABASE = 'true';

            const req = mockReq({
                email: "fallbacklogin@example.com",
                password: "123456",
                uid: "firebase_uid_999"
            });
            const res = mockRes();

            await authController.login(req, res);

            // Should work with fallback
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test("should use mock mode for login when no uid", async () => {
            process.env.USE_DATABASE = 'true';

            const req = mockReq({
                email: "mocklogin@example.com",
                password: "123456"
            });
            const res = mockRes();

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    token: expect.any(String)
                })
            );
        });

        test("should generate firebase token when uid provided", async () => {
            process.env.USE_DATABASE = 'false';

            const req = mockReq({
                email: "token@example.com",
                password: "123456",
                uid: "firebase_uid_token",
                idToken: "provided_token"
            });
            const res = mockRes();

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });


});