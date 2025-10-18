const authController = require("../../src/controllers/authController");

describe("authController", () => {
    const mockReq = (body = {}, user = null) => ({ body, user });
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    test("register returns success with mock user", async () => {
        const req = mockReq({ email: "test@example.com", password: "123456" });
        const res = mockRes();
        await authController.register(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test("login returns mock token", async () => {
        const req = mockReq({ email: "test@example.com", password: "123456" });
        const res = mockRes();
        await authController.login(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: expect.any(String) }));
    });

    test("logout returns success message", async () => {
        const req = mockReq({}, { id: 1 });
        const res = mockRes();
        await authController.logout(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    });
});
