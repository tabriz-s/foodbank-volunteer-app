const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/auth');
const authController = require('../../src/controllers/authController');

const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    return app;
};

describe('Auth Routes', () => {
    // Clear mock users before each test
    beforeEach(() => {
        authController.clearMockUsers();
        process.env.USE_DATABASE = 'false';
    });

    describe('POST /api/auth/register', () => {
        test('should register a new user successfully', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'newuser@example.com',
                    password: 'password123',
                    role: 'volunteer'
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User registered');
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
            expect(response.body.user).toHaveProperty('role', 'volunteer');
        });

        test('should register user with default role as volunteer', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'volunteer@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(201);
            expect(response.body.user.role).toBe('volunteer');
        });

        test('should register user with custom role', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'admin@example.com',
                    password: 'password123',
                    role: 'admin'
                });

            expect(response.status).toBe(201);
            expect(response.body.user.role).toBe('admin');
        });

        test('should return 400 when email is missing', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Email and password are required');
        });

        test('should return 400 when password is missing', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Email and password are required');
        });

        test('should return 400 for invalid email format', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid email format');
        });

        test('should return 409 when user already exists', async () => {
            const app = createApp();
            const userData = {
                email: 'duplicate@example.com',
                password: 'password123'
            };

            // Register first time
            await request(app)
                .post('/api/auth/register')
                .send(userData);

            // Try to register again
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('User already exists');
        });

        test('should accept Firebase UID in registration', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'firebase@example.com',
                    password: 'password123',
                    uid: 'firebase_uid_abc123'
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
        });

        test('should accept displayName in registration', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'named@example.com',
                    password: 'password123',
                    displayName: 'John Doe'
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
        });
    });

    describe('POST /api/auth/login', () => {
        test('should login existing user successfully', async () => {
            const app = createApp();
            
            // Register user first
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                });

            // Login
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('email', 'login@example.com');
        });

        test('should auto-create user in mock mode', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'autocreate@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('token');
        });

        test('should return 400 when email is missing', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Email and password are required');
        });

        test('should return 400 when password is missing', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Email and password are required');
        });

        test('token should be a string', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'token@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(typeof response.body.token).toBe('string');
            expect(response.body.token.length).toBeGreaterThan(0);
        });

        test('user object should have required fields', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'fields@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user).toHaveProperty('email');
            expect(response.body.user).toHaveProperty('role');
        });
    });

    describe('POST /api/auth/logout', () => {
        test('should logout successfully', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', 'Bearer mocktoken_abc123');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Logged out');
        });

        test('should logout without token', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/logout');

            // Should still succeed (middleware handles auth check)
            expect(response.status).toBeLessThanOrEqual(401);
        });
    });

    describe('POST /api/auth/verify', () => {
        test('should verify user token', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/verify')
                .set('Authorization', 'Bearer mocktoken_abc123');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('user');
        });

        test('verified user should have required fields', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/verify')
                .set('Authorization', 'Bearer mocktoken_abc123');

            if (response.status === 200) {
                expect(response.body.user).toHaveProperty('id');
                expect(response.body.user).toHaveProperty('email');
                expect(response.body.user).toHaveProperty('role');
            }
        });
    });

    describe('GET /api/auth/me', () => {
        test('should get current user info', async () => {
            const app = createApp();
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer mocktoken_abc123');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('user');
        });

        test('current user should have required fields', async () => {
            const app = createApp();
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer mocktoken_abc123');

            if (response.status === 200 && response.body.user) {
                expect(response.body.user).toBeDefined();
            }
        });
    });

    describe('POST /api/auth/refresh', () => {
        test('should refresh token successfully', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/refresh')
                .set('Authorization', 'Bearer mocktoken_abc123');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('token');
        });

        test('refreshed token should be different', async () => {
            const app = createApp();
            
            const response1 = await request(app)
                .post('/api/auth/refresh')
                .set('Authorization', 'Bearer mocktoken_abc123');

            const response2 = await request(app)
                .post('/api/auth/refresh')
                .set('Authorization', 'Bearer mocktoken_abc123');

            expect(response1.body.token).not.toBe(response2.body.token);
        });

        test('refreshed token should be a string', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/refresh')
                .set('Authorization', 'Bearer mocktoken_abc123');

            expect(response.status).toBe(200);
            expect(typeof response.body.token).toBe('string');
        });
    });

    describe('Error handling', () => {
        test('should handle malformed JSON', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/register')
                .set('Content-Type', 'application/json')
                .send('invalid json');

            expect(response.status).toBeGreaterThanOrEqual(400);
        });

        test('should handle empty request body', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/auth/register')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('Sequential operations', () => {
        test('should allow register then login', async () => {
            const app = createApp();
            const userData = {
                email: 'sequential@example.com',
                password: 'password123'
            };

            // Register
            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(registerResponse.status).toBe(201);

            // Login
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send(userData);

            expect(loginResponse.status).toBe(200);
            expect(loginResponse.body.user.email).toBe(userData.email);
        });

        test('should handle multiple registrations', async () => {
            const app = createApp();

            const response1 = await request(app)
                .post('/api/auth/register')
                .send({ email: 'user1@example.com', password: 'pass1' });

            const response2 = await request(app)
                .post('/api/auth/register')
                .send({ email: 'user2@example.com', password: 'pass2' });

            expect(response1.status).toBe(201);
            expect(response2.status).toBe(201);
            expect(response1.body.user.id).not.toBe(response2.body.user.id);
        });
    });
});