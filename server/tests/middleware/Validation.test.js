const { validationResult } = require("express-validator");
const {
    validateRegistration,
    validateLogin,
} = require("../../src/middleware/validation");

describe("validation middleware", () => {
    const runMiddleware = async (middlewares, req, res, next) => {
        // Execute each validator rule manually
        for (let mw of middlewares.slice(0, -1)) {
            await mw.run(req);
        }
        // Then run the error handler (the last function in array)
        await middlewares[middlewares.length - 1](req, res, next);
    };

    test("validateRegistration handles missing fields", async () => {
        const req = { body: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await runMiddleware(validateRegistration, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: false })
        );
    });

    test("validateLogin passes valid body", async () => {
        const req = { body: { uid: "abc123", idToken: "token123" } };
        const res = {};
        const next = jest.fn();

        await runMiddleware(validateLogin, req, res, next);

        expect(next).toHaveBeenCalled();
        expect(validationResult(req).isEmpty()).toBe(true);
    });
});
