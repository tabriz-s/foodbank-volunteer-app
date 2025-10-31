const { validationResult } = require("express-validator");
const {
    validateRegistration,
    validateLogin,
    validateProfileUpdate,
    validateEventCreation,
    validateId
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

    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnThis();
        res.json = jest.fn().mockReturnThis();
        return res;
    };

    describe("validateRegistration", () => {
        test("should handle missing fields", async () => {
            const req = { body: {} };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateRegistration, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false })
            );
        });

        test("should pass valid registration data", async () => {
            const req = { 
                body: { 
                    uid: "abc123", 
                    email: "test@example.com",
                    role: "volunteer"
                } 
            };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateRegistration, req, res, next);

            expect(next).toHaveBeenCalled();
            expect(validationResult(req).isEmpty()).toBe(true);
        });

        test("should reject invalid email format", async () => {
            const req = { 
                body: { 
                    uid: "abc123", 
                    email: "not-an-email",
                    role: "volunteer"
                } 
            };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateRegistration, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should reject invalid role", async () => {
            const req = { 
                body: { 
                    uid: "abc123", 
                    email: "test@example.com",
                    role: "invalid_role"
                } 
            };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateRegistration, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should accept optional displayName", async () => {
            const req = { 
                body: { 
                    uid: "abc123", 
                    email: "test@example.com",
                    role: "volunteer",
                    displayName: "Test User"
                } 
            };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateRegistration, req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test("should reject displayName that is too long", async () => {
            const req = { 
                body: { 
                    uid: "abc123", 
                    email: "test@example.com",
                    role: "volunteer",
                    displayName: "a".repeat(51)
                } 
            };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateRegistration, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should reject email that is too long", async () => {
            const req = { 
                body: { 
                    uid: "abc123", 
                    email: "a".repeat(100) + "@example.com",
                    role: "volunteer"
                } 
            };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateRegistration, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe("validateLogin", () => {
        test("should pass valid body", async () => {
            const req = { body: { uid: "abc123", idToken: "token123" } };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateLogin, req, res, next);

            expect(next).toHaveBeenCalled();
            expect(validationResult(req).isEmpty()).toBe(true);
        });

        test("should reject missing uid", async () => {
            const req = { body: { idToken: "token123" } };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateLogin, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should reject missing idToken", async () => {
            const req = { body: { uid: "abc123" } };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateLogin, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should accept optional email", async () => {
            const req = { 
                body: { 
                    uid: "abc123", 
                    idToken: "token123",
                    email: "test@example.com"
                } 
            };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateLogin, req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test("should reject invalid optional email", async () => {
            const req = { 
                body: { 
                    uid: "abc123", 
                    idToken: "token123",
                    email: "not-an-email"
                } 
            };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateLogin, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe("validateProfileUpdate", () => {
        test("should pass valid profile data", async () => {
            const req = { 
                body: { 
                    fullName: "John Doe",
                    address1: "123 Main St",
                    city: "Houston",
                    state: "TX",
                    zipCode: "77001"
                } 
            };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateProfileUpdate, req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test("should reject invalid state code", async () => {
            const req = { 
                body: { 
                    state: "Texas"
                } 
            };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateProfileUpdate, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should accept valid zipcode formats", async () => {
            const req1 = { body: { zipCode: "12345" } };
            const req2 = { body: { zipCode: "12345-6789" } };
            const res1 = mockRes();
            const res2 = mockRes();
            const next = jest.fn();

            await runMiddleware(validateProfileUpdate, req1, res1, next);
            await runMiddleware(validateProfileUpdate, req2, res2, next);

            expect(next).toHaveBeenCalledTimes(2);
        });

        test("should reject invalid zipcode", async () => {
            const req = { body: { zipCode: "1234" } };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateProfileUpdate, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should reject skills if empty array", async () => {
            const req = { body: { skills: [] } };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateProfileUpdate, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should accept valid skills array", async () => {
            const req = { body: { skills: ["cooking", "driving"] } };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateProfileUpdate, req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test("should reject availability if empty", async () => {
            const req = { body: { availability: [] } };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateProfileUpdate, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should accept valid availability dates", async () => {
            const req = { 
                body: { 
                    availability: ["2024-01-01", "2024-01-02"] 
                } 
            };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateProfileUpdate, req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test("should reject invalid date in availability", async () => {
            const req = { 
                body: { 
                    availability: ["not-a-date"] 
                } 
            };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateProfileUpdate, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should reject fullName with numbers", async () => {
            const req = { body: { fullName: "John123" } };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateProfileUpdate, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should accept fullName with hyphens and apostrophes", async () => {
            const req = { body: { fullName: "Mary-Jane O'Connor" } };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateProfileUpdate, req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test("should reject preferences that are too long", async () => {
            const req = { body: { preferences: "a".repeat(501) } };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateProfileUpdate, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe("validateEventCreation", () => {
        test("should pass valid event data", async () => {
            const req = { 
                body: { 
                    eventName: "Food Distribution",
                    eventDescription: "Distributing food to families in need",
                    location: "123 Main St, Houston, TX",
                    requiredSkills: ["manual labor"],
                    urgency: "medium",
                    eventDate: "2025-12-31"
                } 
            };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateEventCreation, req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test("should reject event with past date", async () => {
            const req = { 
                body: { 
                    eventName: "Past Event",
                    eventDescription: "This event is in the past",
                    location: "123 Main St",
                    requiredSkills: ["cooking"],
                    urgency: "low",
                    eventDate: "2020-01-01"
                } 
            };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateEventCreation, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should reject eventName that is too short", async () => {
            const req = { 
                body: { 
                    eventName: "",
                    eventDescription: "Valid description here",
                    location: "123 Main St",
                    requiredSkills: ["cooking"],
                    urgency: "low",
                    eventDate: "2025-12-31"
                } 
            };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateEventCreation, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should reject description that is too short", async () => {
            const req = { 
                body: { 
                    eventName: "Valid Name",
                    eventDescription: "Short",
                    location: "123 Main St",
                    requiredSkills: ["cooking"],
                    urgency: "low",
                    eventDate: "2025-12-31"
                } 
            };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateEventCreation, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should reject empty requiredSkills", async () => {
            const req = { 
                body: { 
                    eventName: "Valid Name",
                    eventDescription: "Valid description here",
                    location: "123 Main St",
                    requiredSkills: [],
                    urgency: "low",
                    eventDate: "2025-12-31"
                } 
            };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateEventCreation, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should reject invalid urgency level", async () => {
            const req = { 
                body: { 
                    eventName: "Valid Name",
                    eventDescription: "Valid description here",
                    location: "123 Main St",
                    requiredSkills: ["cooking"],
                    urgency: "super-urgent",
                    eventDate: "2025-12-31"
                } 
            };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateEventCreation, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should accept all valid urgency levels", async () => {
            const urgencyLevels = ['low', 'medium', 'high', 'critical'];
            const next = jest.fn();

            for (const urgency of urgencyLevels) {
                const req = { 
                    body: { 
                        eventName: "Valid Name",
                        eventDescription: "Valid description here",
                        location: "123 Main St",
                        requiredSkills: ["cooking"],
                        urgency: urgency,
                        eventDate: "2025-12-31"
                    } 
                };
                const res = mockRes();

                await runMiddleware(validateEventCreation, req, res, next);
                expect(next).toHaveBeenCalled();
                jest.clearAllMocks();
            }
        });
    });

    describe("validateId", () => {
        test("should pass valid ID", async () => {
            const req = { body: { id: "abc123" } };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateId, req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test("should reject missing ID", async () => {
            const req = { body: {} };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateId, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should reject non-string ID", async () => {
            const req = { body: { id: 123 } };
            const res = mockRes();
            const next = jest.fn();

            await runMiddleware(validateId, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});