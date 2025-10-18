const request = require('supertest');
const express = require('express');
const { validateEventCreate, validateEventUpdate } = require('../../src/middleware/EventValidation');

const createTestApp = (validationMiddleware) => {
    const app = express();
    app.use(express.json());
    app.post('/test', validationMiddleware, (req, res) => {
        res.status(200).json({ success: true, message: 'Validation passed' });
    });
    return app;
};
describe('Event Validation', () => {

    describe('validateEventCreate', () => {
        test('should pass with valid data', async () => {
            const app = createTestApp(validateEventCreate);
            
            const response = await request(app)
                .post('/test')
                .send({
                    name: 'Test Event',
                    description: 'Test Description',
                    location: 'Test Location',
                    date: '2025-12-01',
                    requiredSkills: [1, 2],
                    urgency: 'High'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('should fail when name is missing', async () => {
            const app = createTestApp(validateEventCreate);
            
            const response = await request(app)
                .post('/test')
                .send({
                    description: 'Test',
                    location: 'Test',
                    date: '2025-12-01',
                    requiredSkills: [1],
                    urgency: 'Medium'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should fail when requiredSkills is empty', async () => {
            const app = createTestApp(validateEventCreate);
            
            const response = await request(app)
                .post('/test')
                .send({
                    name: 'Test',
                    description: 'Test',
                    location: 'Test',
                    date: '2025-12-01',
                    requiredSkills: [],
                    urgency: 'Medium'
                });

            expect(response.status).toBe(400);
        });

        test('should fail for invalid urgency', async () => {
            const app = createTestApp(validateEventCreate);
            
            const response = await request(app)
                .post('/test')
                .send({
                    name: 'Test',
                    description: 'Test',
                    location: 'Test',
                    date: '2025-12-01',
                    requiredSkills: [1],
                    urgency: 'Invalid'
                });

            expect(response.status).toBe(400);
        });
    });

    describe('validateEventUpdate', () => {
        test('should pass with valid update', async () => {
            const app = createTestApp(validateEventUpdate);
            
            const response = await request(app)
                .post('/test')
                .send({ urgency: 'Critical' });

            expect(response.status).toBe(200);
        });

        test('should pass with empty body', async () => {
            const app = createTestApp(validateEventUpdate);
            
            const response = await request(app)
                .post('/test')
                .send({});

            expect(response.status).toBe(200);
        });

        test('should validate name length if provided', async () => {
            const app = createTestApp(validateEventUpdate);
            
            const response = await request(app)
                .post('/test')
                .send({ name: 'A'.repeat(101) });

            expect(response.status).toBe(400);
        });
    });
});