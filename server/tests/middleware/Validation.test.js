const { validateRegistration, validateLogin } = require("../../src/middleware/validation");

describe("validation middleware", () => {
    test("validateRegistration handles missing fields", async () => {
        const req = { body: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await validateRegistration(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("validateLogin passes valid body", async () => {
        const req = { body: { email: "test@example.com", password: "123456" } };
        const res = {};
        const next = jest.fn();

        await validateLogin(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});
