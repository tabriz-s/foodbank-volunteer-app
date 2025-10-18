const request = require('supertest');
const express = require('express');
const adminRoutes = require('../src/routes/admin');

const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/admin', adminRoutes);
    return app;
};
describe('Admin Routes', () => {

    describe('GET /api/admin/dashboard', () => {
        test('should return dashboard statistics', async () => {
            const app = createApp();
            const response = await request(app).get('/api/admin/dashboard');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('totalEvents');
            expect(response.body.data).toHaveProperty('totalVolunteers');
        });

        test('stats should be numbers', async () => {
            const app = createApp();
            const response = await request(app).get('/api/admin/dashboard');

            const stats = response.body.data;
            expect(typeof stats.totalEvents).toBe('number');
            expect(typeof stats.totalVolunteers).toBe('number');
        });
    });
    describe('GET /api/admin/activities', () => {
        test('should return recent activities', async () => {
            const app = createApp();
            const response = await request(app).get('/api/admin/activities');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('should respect limit parameter', async () => {
            const app = createApp();
            const response = await request(app)
                .get('/api/admin/activities?limit=3');

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBeLessThanOrEqual(3);
        });

        test('activities should have required fields', async () => {
            const app = createApp();
            const response = await request(app).get('/api/admin/activities');

            if (response.body.data.length > 0) {
                const activity = response.body.data[0];
                expect(activity).toHaveProperty('id');
                expect(activity).toHaveProperty('action');
                expect(activity).toHaveProperty('timestamp');
            }
        });
    });
});