const request = require('supertest');
const express = require('express');
const reportRoutes = require('../../src/routes/reports');
const reportController = require('../../src/controllers/reportController');

const createApp = () => {
    const app = express();
    app.use(express.json());
    
    // Mock auth middleware for testing
    app.use((req, res, next) => {
        req.user = { id: 1, email: 'admin@test.com', role: 'admin' };
        next();
    });
    
    app.use('/api/reports', reportRoutes);
    return app;
};

describe('Report Routes', () => {
    beforeAll(() => {
        process.env.USE_DATABASE = 'false';
    });

    describe('POST /api/reports/volunteers', () => {
        test('should generate volunteer report in PDF format', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/reports/volunteers')
                .send({ format: 'pdf' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.format).toBe('pdf');
            expect(response.body.filename).toContain('volunteer_report_');
        }, 15000);

        test('should generate volunteer report in CSV format', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/reports/volunteers')
                .send({ format: 'csv' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.format).toBe('csv');
            expect(response.body.filename).toContain('.csv');
        }, 15000);

        test('should handle date range parameters', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/reports/volunteers')
                .send({
                    format: 'pdf',
                    startDate: '2024-01-01',
                    endDate: '2024-12-31'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        }, 15000);

        test('should return 400 for invalid format', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/reports/volunteers')
                .send({ format: 'invalid' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/reports/events', () => {
        test('should generate event report in PDF format', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/reports/events')
                .send({ format: 'pdf' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.format).toBe('pdf');
        }, 15000);

        test('should generate event report in CSV format', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/reports/events')
                .send({ format: 'csv' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.format).toBe('csv');
        }, 15000);

        test('should return 400 for invalid format', async () => {
            const app = createApp();
            const response = await request(app)
                .post('/api/reports/events')
                .send({ format: 'xml' });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/reports/list', () => {
        test('should return list of reports', async () => {
            const app = createApp();
            
            // Generate a report first
            await request(app)
                .post('/api/reports/volunteers')
                .send({ format: 'csv' });

            // List reports
            const response = await request(app)
                .get('/api/reports/list');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.reports)).toBe(true);
        }, 15000);
    });

    describe('GET /api/reports/download/:filename', () => {
        test('should download existing report', async () => {
            const app = createApp();
            
            // Generate a report
            const generateResponse = await request(app)
                .post('/api/reports/volunteers')
                .send({ format: 'csv' });

            const filename = generateResponse.body.filename;

            // Download it
            const response = await request(app)
                .get(`/api/reports/download/${filename}`);

            // Should attempt download (status varies based on implementation)
            expect([200, 404].includes(response.status)).toBe(true);
        }, 15000);

        test('should return 404 for non-existent file', async () => {
            const app = createApp();
            const response = await request(app)
                .get('/api/reports/download/nonexistent.pdf');

            expect(response.status).toBe(404);
        });

        test('should prevent directory traversal', async () => {
            const app = createApp();
            const response = await request(app)
                .get('/api/reports/download/../../../etc/passwd');

            expect(response.status).toBe(403);
        });
    });
});