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

        test('should fail when name exceeds 100 characters', async () => {
            const app = createTestApp(validateEventCreate);
            
            const response = await request(app)
                .post('/test')
                .send({
                    name: 'A'.repeat(101),
                    description: 'Test',
                    location: 'Test',
                    date: '2025-12-01',
                    requiredSkills: [1],
                    urgency: 'Medium'
                });
            
            expect(response.status).toBe(400);
        });

        test('should fail when description is missing', async () => {
            const app = createTestApp(validateEventCreate);
            
            const response = await request(app)
                .post('/test')
                .send({
                    name: 'Test',
                    location: 'Test',
                    date: '2025-12-01',
                    requiredSkills: [1],
                    urgency: 'Medium'
                });
            
            expect(response.status).toBe(400);
        });

        test('should fail when location is missing', async () => {
            const app = createTestApp(validateEventCreate);
            
            const response = await request(app)
                .post('/test')
                .send({
                    name: 'Test',
                    description: 'Test',
                    date: '2025-12-01',
                    requiredSkills: [1],
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

        test('should fail when date is missing', async () => {
            const app = createTestApp(validateEventCreate);
            
            const response = await request(app)
                .post('/test')
                .send({
                    name: 'Test',
                    description: 'Test',
                    location: 'Test',
                    requiredSkills: [1],
                    urgency: 'Medium'
                });
            
            expect(response.status).toBe(400);
        });

        test('should fail for invalid date format', async () => {
            const app = createTestApp(validateEventCreate);
            
            const response = await request(app)
                .post('/test')
                .send({
                    name: 'Test',
                    description: 'Test',
                    location: 'Test',
                    date: 'invalid-date',
                    requiredSkills: [1],
                    urgency: 'Medium'
                });
            
            expect(response.status).toBe(400);
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

        test('should fail when requiredSkills is not an array', async () => {
            const app = createTestApp(validateEventCreate);
            
            const response = await request(app)
                .post('/test')
                .send({
                    name: 'Test',
                    description: 'Test',
                    location: 'Test',
                    date: '2025-12-01',
                    requiredSkills: 'not-an-array',
                    urgency: 'Medium'
                });
            
            expect(response.status).toBe(400);
        });

        test('should trim whitespace from fields', async () => {
            const app = createTestApp(validateEventCreate);
            
            const response = await request(app)
                .post('/test')
                .send({
                    name: '  Test Event  ',
                    description: '  Test Description  ',
                    location: '  Test Location  ',
                    date: '2025-12-01',
                    requiredSkills: [1],
                    urgency: 'High'
                });
            
            expect(response.status).toBe(200);
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

        test('should fail when name is empty string', async () => {
            const app = createTestApp(validateEventUpdate);
            
            const response = await request(app)
                .post('/test')
                .send({ name: '   ' });
            
            expect(response.status).toBe(400);
        });

        test('should fail when description is empty string', async () => {
            const app = createTestApp(validateEventUpdate);
            
            const response = await request(app)
                .post('/test')
                .send({ description: '   ' });
            
            expect(response.status).toBe(400);
        });

        test('should fail when location is empty string', async () => {
            const app = createTestApp(validateEventUpdate);
            
            const response = await request(app)
                .post('/test')
                .send({ location: '   ' });
            
            expect(response.status).toBe(400);
        });

        test('should fail for invalid urgency in update', async () => {
            const app = createTestApp(validateEventUpdate);
            
            const response = await request(app)
                .post('/test')
                .send({ urgency: 'InvalidLevel' });
            
            expect(response.status).toBe(400);
        });

        test('should fail for invalid date format in update', async () => {
            const app = createTestApp(validateEventUpdate);
            
            const response = await request(app)
                .post('/test')
                .send({ date: '15-01-2026' });
            
            expect(response.status).toBe(400);
        });

        test('should fail when requiredSkills is not an array in update', async () => {
            const app = createTestApp(validateEventUpdate);
            
            const response = await request(app)
                .post('/test')
                .send({ requiredSkills: 'not-an-array' });
            
            expect(response.status).toBe(400);
        });

        test('should pass with valid status values', async () => {
            const app = createTestApp(validateEventUpdate);
            
            const response = await request(app)
                .post('/test')
                .send({ status: 'active' });
            
            expect(response.status).toBe(200);
        });

        test('should fail for invalid status value', async () => {
            const app = createTestApp(validateEventUpdate);
            
            const response = await request(app)
                .post('/test')
                .send({ status: 'invalid-status' });
            
            expect(response.status).toBe(400);
        });

        test('should pass with multiple valid fields updated', async () => {
            const app = createTestApp(validateEventUpdate);
            
            const response = await request(app)
                .post('/test')
                .send({
                    name: 'Updated Event',
                    urgency: 'High',
                    status: 'active',
                    date: '2026-03-20'
                });
            
            expect(response.status).toBe(200);
        });
    });
});