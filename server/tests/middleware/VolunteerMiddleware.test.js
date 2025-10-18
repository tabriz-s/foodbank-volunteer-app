const request = require('supertest');
const express = require('express');
const { validateProfile } = require('../../src/middleware/VolunteerMiddleware');

// Create a test Express app
const createTestApp = () => {
    const app = express();
    app.use(express.json());
    
    // Test route that uses validation
    app.post('/test', validateProfile, (req, res) => {
        res.status(200).json({ success: true, message: 'Validation passed' });
    });
    
    return app;
};

describe('Validation Middleware', () => {

    describe('validateProfile', () => {
        
        test('should pass validation with all valid required fields', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .post('/test')
                .send({
                    user_id: 1,
                    full_name: 'John Doe',
                    phone_number: '123-456-7890',
                    address_1: '123 Main St',
                    city: 'Houston',
                    state: 'TX',
                    zip_code: '77001',
                    skills: [
                        { Skills_id: 1, Experience_level: 'beginner', Date_acquired: '2024-01-01' }
                    ],
                    availability_days: ['monday', 'tuesday']
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('should pass validation with optional fields', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .post('/test')
                .send({
                    user_id: 1,
                    full_name: 'John Doe',
                    phone_number: '123-456-7890',
                    address_1: '123 Main St',
                    address_2: 'Apt 4B',
                    city: 'Houston',
                    state: 'TX',
                    zip_code: '77001-1234',
                    skills: [
                        { Skills_id: 1, Experience_level: 'intermediate', Date_acquired: '2024-01-01' }
                    ],
                    preferences: 'Weekend shifts preferred',
                    availability_days: ['saturday', 'sunday']
                });

            expect(response.status).toBe(200);
        });

        test('should fail when full_name is missing', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .post('/test')
                .send({
                    phone_number: '123-456-7890',
                    address_1: '123 Main St',
                    city: 'Houston',
                    state: 'TX',
                    zip_code: '77001',
                    skills: [
                        { Skills_id: 1, Experience_level: 'beginner', Date_acquired: '2024-01-01' }
                    ],
                    availability_days: ['monday']
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        test('should fail when full_name exceeds 50 characters', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .post('/test')
                .send({
                    full_name: 'A'.repeat(51),
                    phone_number: '123-456-7890',
                    address_1: '123 Main St',
                    city: 'Houston',
                    state: 'TX',
                    zip_code: '77001',
                    skills: [
                        { Skills_id: 1, Experience_level: 'beginner', Date_acquired: '2024-01-01' }
                    ],
                    availability_days: ['monday']
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should fail when phone_number is invalid', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .post('/test')
                .send({
                    full_name: 'John Doe',
                    phone_number: '12345',
                    address_1: '123 Main St',
                    city: 'Houston',
                    state: 'TX',
                    zip_code: '77001',
                    skills: [
                        { Skills_id: 1, Experience_level: 'beginner', Date_acquired: '2024-01-01' }
                    ],
                    availability_days: ['monday']
                });

            expect(response.status).toBe(400);
        });

        test('should fail when address_1 is missing', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .post('/test')
                .send({
                    full_name: 'John Doe',
                    phone_number: '123-456-7890',
                    city: 'Houston',
                    state: 'TX',
                    zip_code: '77001',
                    skills: [
                        { Skills_id: 1, Experience_level: 'beginner', Date_acquired: '2024-01-01' }
                    ],
                    availability_days: ['monday']
                });

            expect(response.status).toBe(400);
        });

        test('should fail when city is missing', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .post('/test')
                .send({
                    full_name: 'John Doe',
                    phone_number: '123-456-7890',
                    address_1: '123 Main St',
                    state: 'TX',
                    zip_code: '77001',
                    skills: [
                        { Skills_id: 1, Experience_level: 'beginner', Date_acquired: '2024-01-01' }
                    ],
                    availability_days: ['monday']
                });

            expect(response.status).toBe(400);
        });

        test('should fail when state is missing', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .post('/test')
                .send({
                    full_name: 'John Doe',
                    phone_number: '123-456-7890',
                    address_1: '123 Main St',
                    city: 'Houston',
                    zip_code: '77001',
                    skills: [
                        { Skills_id: 1, Experience_level: 'beginner', Date_acquired: '2024-01-01' }
                    ],
                    availability_days: ['monday']
                });

            expect(response.status).toBe(400);
        });

        test('should fail when zip_code is invalid', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .post('/test')
                .send({
                    full_name: 'John Doe',
                    phone_number: '123-456-7890',
                    address_1: '123 Main St',
                    city: 'Houston',
                    state: 'TX',
                    zip_code: '1234',
                    skills: [
                        { Skills_id: 1, Experience_level: 'beginner', Date_acquired: '2024-01-01' }
                    ],
                    availability_days: ['monday']
                });

            expect(response.status).toBe(400);
        });

        test('should fail when skills array is empty', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .post('/test')
                .send({
                    full_name: 'John Doe',
                    phone_number: '123-456-7890',
                    address_1: '123 Main St',
                    city: 'Houston',
                    state: 'TX',
                    zip_code: '77001',
                    skills: [],
                    availability_days: ['monday']
                });

            expect(response.status).toBe(400);
        });

        test('should fail when skill missing Skills_id', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .post('/test')
                .send({
                    full_name: 'John Doe',
                    phone_number: '123-456-7890',
                    address_1: '123 Main St',
                    city: 'Houston',
                    state: 'TX',
                    zip_code: '77001',
                    skills: [
                        { Experience_level: 'beginner', Date_acquired: '2024-01-01' }
                    ],
                    availability_days: ['monday']
                });

            expect(response.status).toBe(400);
        });

        test('should fail when skill missing Experience_level', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .post('/test')
                .send({
                    full_name: 'John Doe',
                    phone_number: '123-456-7890',
                    address_1: '123 Main St',
                    city: 'Houston',
                    state: 'TX',
                    zip_code: '77001',
                    skills: [
                        { Skills_id: 1, Date_acquired: '2024-01-01' }
                    ],
                    availability_days: ['monday']
                });

            expect(response.status).toBe(400);
        });

        test('should fail when skill has invalid Experience_level', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .post('/test')
                .send({
                    full_name: 'John Doe',
                    phone_number: '123-456-7890',
                    address_1: '123 Main St',
                    city: 'Houston',
                    state: 'TX',
                    zip_code: '77001',
                    skills: [
                        { Skills_id: 1, Experience_level: 'invalid', Date_acquired: '2024-01-01' }
                    ],
                    availability_days: ['monday']
                });

            expect(response.status).toBe(400);
        });

        test('should fail when skill missing Date_acquired', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .post('/test')
                .send({
                    full_name: 'John Doe',
                    phone_number: '123-456-7890',
                    address_1: '123 Main St',
                    city: 'Houston',
                    state: 'TX',
                    zip_code: '77001',
                    skills: [
                        { Skills_id: 1, Experience_level: 'beginner' }
                    ],
                    availability_days: ['monday']
                });

            expect(response.status).toBe(400);
        });

        test('should fail when availability_days is empty', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .post('/test')
                .send({
                    full_name: 'John Doe',
                    phone_number: '123-456-7890',
                    address_1: '123 Main St',
                    city: 'Houston',
                    state: 'TX',
                    zip_code: '77001',
                    skills: [
                        { Skills_id: 1, Experience_level: 'beginner', Date_acquired: '2024-01-01' }
                    ],
                    availability_days: []
                });

            expect(response.status).toBe(400);
        });

        test('should accept multiple skills', async () => {
            const app = createTestApp();
            
            const response = await request(app)
                .post('/test')
                .send({
                    full_name: 'John Doe',
                    phone_number: '123-456-7890',
                    address_1: '123 Main St',
                    city: 'Houston',
                    state: 'TX',
                    zip_code: '77001',
                    skills: [
                        { Skills_id: 1, Experience_level: 'beginner', Date_acquired: '2024-01-01' },
                        { Skills_id: 2, Experience_level: 'intermediate', Date_acquired: '2024-02-01' },
                        { Skills_id: 3, Experience_level: 'expert', Date_acquired: '2024-03-01' }
                    ],
                    availability_days: ['monday', 'tuesday']
                });

            expect(response.status).toBe(200);
        });
    });

});