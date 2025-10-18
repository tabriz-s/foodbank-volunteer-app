const request = require('supertest');
const express = require('express');
const skillsRouter = require('../../src/routes/skills');

// Create test app with the skills router
const createTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/skills', skillsRouter);
    return app;
};

describe('Skills Routes', () => {

    describe('GET /api/skills', () => {
        test('should return all skills', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .get('/api/skills');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('should return 9 skills', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .get('/api/skills');

            expect(response.body.data).toHaveLength(9);
        });

        test('each skill should have required properties', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .get('/api/skills');

            response.body.data.forEach(skill => {
                expect(skill).toHaveProperty('Skills_id');
                expect(skill).toHaveProperty('Description');
                expect(skill).toHaveProperty('Category');
            });
        });

        test('should include all categories', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .get('/api/skills');

            const categories = response.body.data.map(s => s.Category);
            const uniqueCategories = [...new Set(categories)];
            
            expect(uniqueCategories.length).toBeGreaterThan(1);
            expect(uniqueCategories).toContain('Food_Preparation');
        });
    });

});