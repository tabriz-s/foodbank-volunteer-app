const request = require('supertest');
const express = require('express');
const eventRoutes = require('../src/routes/events');

const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/events', eventRoutes);
    return app;
};

describe('Events Routes', () => {

    describe('GET /api/events', () => {
        test('should return all events', async () => {
            const app = createApp();
            const response = await request(app).get('/api/events');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('GET /api/events/:id', () => {
        test('should return a single event', async () => {
            const app = createApp();
            const response = await request(app).get('/api/events/1');

            expect(response.status).toBe(200);
            expect(response.body.data.Event_id).toBe(1);
        });

        test('should return 404 for non-existent event', async () => {
            const app = createApp();
            const response = await request(app).get('/api/events/999');

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/events', () => {
        test('should create a new event', async () => {
            const app = createApp();
            const newEvent = {
                name: 'Test Event',
                description: 'Test Description',
                location: 'Test Location',
                date: '2025-12-01',
                requiredSkills: [1],
                urgency: 'Medium'
            };

            const response = await request(app)
                .post('/api/events')
                .send(newEvent);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
        });

        test('should return 400 for invalid data', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/events')
                .send({});

            expect(response.status).toBe(400);
        });
    });

    describe('PUT /api/events/:id', () => {
        test('should update an event', async () => {
            const app = createApp();
            const response = await request(app)
                .put('/api/events/1')
                .send({ urgency: 'High' });

            expect(response.status).toBe(200);
        });
    });
    describe('DELETE /api/events/:id', () => {
        test('should delete an event', async () => {
            const app = createApp();
            const response = await request(app).delete('/api/events/1');

            expect(response.status).toBe(200);
        });
    });
});