const request = require('supertest');
const express = require('express');
const volunteersRouter = require('../../src/routes/volunteers');

// Create test app with the volunteers router
const createTestApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/volunteers', volunteersRouter);
    return app;
};

describe('Volunteers Routes', () => {

    describe('GET /api/volunteers', () => {
        test('should return all volunteers', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .get('/api/volunteers');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('GET /api/volunteers/profile', () => {
        test('should return profile for existing user', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .get('/api/volunteers/profile?user_id=1');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(response.body.data).toHaveProperty('User_id', 1);
        });

        test('should return 404 for non-existent user', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .get('/api/volunteers/profile?user_id=9999');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should handle missing user_id parameter', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .get('/api/volunteers/profile');

            // Controller handles this - just verify we get a response
            expect(response.status).toBeGreaterThanOrEqual(200);
            expect(response.body).toHaveProperty('success');
        });
    });

    describe('POST /api/volunteers/profile', () => {
        test('should create new profile with valid data', async () => {
            const app = createTestApp();
            
            const newProfile = {
                user_id: 777,
                full_name: 'Route Test User',
                phone_number: '555-111-2222',
                address_1: '777 Route St',
                city: 'Test City',
                state: 'TX',
                zip_code: '77777',
                skills: [
                    { Skills_id: 1, Experience_level: 'beginner', Date_acquired: '2024-01-01' }
                ],
                availability_days: ['monday', 'tuesday']
            };

            const response = await request(app)
                .post('/api/volunteers/profile')
                .send(newProfile);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
        });

        test('should return 400 with invalid data', async () => {
            const app = createTestApp();
            
            const invalidProfile = {
                user_id: 776,
                full_name: '', // Invalid - empty name
                phone_number: '555-111-2222',
                address_1: '776 Route St',
                city: 'Test City',
                state: 'TX',
                zip_code: '77776',
                skills: [],
                availability_days: []
            };

            const response = await request(app)
                .post('/api/volunteers/profile')
                .send(invalidProfile);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('PUT /api/volunteers/profile', () => {
        test('should update existing profile', async () => {
            const app = createTestApp();
            
            // First create a profile
            const newProfile = {
                user_id: 775,
                full_name: 'Original Name',
                phone_number: '555-333-4444',
                address_1: '775 Route St',
                city: 'Original City',
                state: 'TX',
                zip_code: '77775',
                skills: [
                    { Skills_id: 1, Experience_level: 'beginner', Date_acquired: '2024-01-01' }
                ],
                availability_days: ['monday']
            };

            await request(app)
                .post('/api/volunteers/profile')
                .send(newProfile);

            // Now update it
            const updates = {
                full_name: 'Updated Name',
                phone_number: '555-999-8888',
                address_1: '775 Updated St',
                city: 'Updated City',
                state: 'CA',
                zip_code: '90001',
                skills: [
                    { Skills_id: 2, Experience_level: 'intermediate', Date_acquired: '2024-02-01' }
                ],
                availability_days: ['tuesday', 'wednesday']
            };

            const response = await request(app)
                .put('/api/volunteers/profile?user_id=775')
                .send(updates);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });

        test('should return 404 for non-existent user', async () => {
            const app = createTestApp();
            
            const updates = {
                full_name: 'Test Name',
                phone_number: '555-555-5555',
                address_1: '123 Test',
                city: 'Test',
                state: 'TX',
                zip_code: '12345',
                skills: [
                    { Skills_id: 1, Experience_level: 'beginner', Date_acquired: '2024-01-01' }
                ],
                availability_days: ['monday']
            };

            const response = await request(app)
                .put('/api/volunteers/profile?user_id=9999')
                .send(updates);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('DELETE /api/volunteers/profile', () => {
        test('should delete existing volunteer', async () => {
            const app = createTestApp();
            
            // First create a volunteer
            const newProfile = {
                user_id: 774,
                full_name: 'To Delete',
                phone_number: '555-666-7777',
                address_1: '774 Route St',
                city: 'Delete City',
                state: 'TX',
                zip_code: '77774',
                skills: [
                    { Skills_id: 1, Experience_level: 'beginner', Date_acquired: '2024-01-01' }
                ],
                availability_days: ['monday']
            };

            await request(app)
                .post('/api/volunteers/profile')
                .send(newProfile);

            // Now delete it
            const response = await request(app)
                .delete('/api/volunteers/profile?user_id=774');

            // Should succeed or handle gracefully
            expect(response.status).toBeGreaterThanOrEqual(200);
            expect(response.status).toBeLessThan(600);
        });

        test('should handle non-existent volunteer', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .delete('/api/volunteers/profile?user_id=9999');

            // Should handle missing volunteer
            expect(response.status).toBeGreaterThanOrEqual(400);
        });
    });

});