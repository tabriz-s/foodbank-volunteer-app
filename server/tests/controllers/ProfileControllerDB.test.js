const request = require('supertest');
const express = require('express');
const ProfileControllerDB = require('../../src/controllers/ProfileControllerDB');
const VolunteerModelDB = require('../../src/models/VolunteerModelDB');
const VolunteerSkillsModelDB = require('../../src/models/VolunteerSkillsModelDB');

// Mock the models
jest.mock('../../src/models/VolunteerModelDB');
jest.mock('../../src/models/VolunteerSkillsModelDB');

// Create Express app for testing
const app = express();
app.use(express.json());

// Setup routes
app.get('/api/volunteers/db', ProfileControllerDB.getAllVolunteersDB);
app.get('/api/volunteers/db/profile', ProfileControllerDB.getProfileDB);
app.get('/api/volunteers/db/:id', ProfileControllerDB.getVolunteerByIdDB);
app.post('/api/volunteers/db/profile', ProfileControllerDB.createProfileDB);
app.put('/api/volunteers/db/profile', ProfileControllerDB.updateProfileDB);

describe('ProfileControllerDB', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllVolunteersDB', () => {
        test('should return all volunteers successfully', async () => {
            const mockVolunteers = [
                { Volunteer_id: 1, First_name: 'Michael', Last_name: 'Pearson' },
                { Volunteer_id: 2, First_name: 'Sarah', Last_name: 'Johnson' }
            ];

            VolunteerModelDB.getAllVolunteers.mockResolvedValue(mockVolunteers);

            const response = await request(app).get('/api/volunteers/db');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.source).toBe('Azure MySQL Database');
            expect(response.body.data).toEqual(mockVolunteers);
            expect(response.body.count).toBe(2);
        });

        test('should handle database error', async () => {
            VolunteerModelDB.getAllVolunteers.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/volunteers/db');

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Failed to retrieve volunteers');
        });
    });

    describe('getProfileDB', () => {
        test('should return profile with skills successfully', async () => {
            const mockVolunteer = {
                Volunteer_id: 1,
                User_id: 1,
                First_name: 'Michael',
                Last_name: 'Pearson',
                City: 'Houston'
            };

            const mockSkills = [
                {
                    Skills_id: 1,
                    Description: 'Cooking',
                    Category: 'Food_Preparation',
                    Experience_level: 'intermediate',
                    Date_acquired: '2023-01-15'
                }
            ];

            VolunteerModelDB.getVolunteerWithUser_id.mockResolvedValue(mockVolunteer);
            VolunteerSkillsModelDB.getVolunteerSkillsWithDetails.mockResolvedValue(mockSkills);

            const response = await request(app)
                .get('/api/volunteers/db/profile')
                .query({ user_id: 1 });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('Volunteer_id', 1);
            expect(response.body.data.skills).toEqual(mockSkills);
        });

        test('should return 400 if user_id is missing', async () => {
            const response = await request(app).get('/api/volunteers/db/profile');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('user_id is required');
        });

        test('should return 404 if profile not found', async () => {
            VolunteerModelDB.getVolunteerWithUser_id.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/volunteers/db/profile')
                .query({ user_id: 999 });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('not found');
        });

        test('should handle skills fetch error gracefully', async () => {
            const mockVolunteer = {
                Volunteer_id: 1,
                User_id: 1,
                First_name: 'Michael'
            };

            VolunteerModelDB.getVolunteerWithUser_id.mockResolvedValue(mockVolunteer);
            VolunteerSkillsModelDB.getVolunteerSkillsWithDetails.mockRejectedValue(
                new Error('Skills error')
            );

            const response = await request(app)
                .get('/api/volunteers/db/profile')
                .query({ user_id: 1 });

            expect(response.status).toBe(200);
            expect(response.body.data.skills).toEqual([]);
        });
    });

    describe('getVolunteerByIdDB', () => {
        test('should return volunteer by ID successfully', async () => {
            const mockVolunteer = {
                Volunteer_id: 1,
                First_name: 'Michael',
                Last_name: 'Pearson'
            };

            VolunteerModelDB.getVolunteerById.mockResolvedValue(mockVolunteer);

            const response = await request(app).get('/api/volunteers/db/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockVolunteer);
        });

        test('should return 404 if volunteer not found', async () => {
            VolunteerModelDB.getVolunteerById.mockResolvedValue(null);

            const response = await request(app).get('/api/volunteers/db/999');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('createProfileDB', () => {
        test('should create profile with skills successfully', async () => {
            const profileData = {
                user_id: 10,
                full_name: 'New User Test',
                phone_number: '(555) 123-4567',
                address_1: '123 Test St',
                city: 'Houston',
                state: 'TX',
                zip_code: '77001',
                skills: [
                    {
                        Skills_id: 1,
                        Experience_level: 'beginner',
                        Date_acquired: '2024-01-15'
                    }
                ],
                availability_days: ['monday', 'wednesday'],
                preferences: 'Morning shifts'
            };

            const mockCreatedVolunteer = {
                Volunteer_id: 10,
                User_id: 10,
                First_name: 'New',
                Last_name: 'User Test',
                City: 'Houston'
            };

            VolunteerModelDB.createVolunteer.mockResolvedValue(mockCreatedVolunteer);
            VolunteerSkillsModelDB.addMultipleSkills.mockResolvedValue({});

            const response = await request(app)
                .post('/api/volunteers/db/profile')
                .send(profileData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('created successfully');
            expect(response.body.data).toHaveProperty('Volunteer_id', 10);
            expect(VolunteerModelDB.createVolunteer).toHaveBeenCalled();
            expect(VolunteerSkillsModelDB.addMultipleSkills).toHaveBeenCalled();
        });

        test('should create profile without skills', async () => {
            const profileData = {
                user_id: 11,
                full_name: 'Simple User',
                phone_number: '(555) 999-8888',
                address_1: '456 Simple St',
                city: 'Dallas',
                state: 'TX',
                zip_code: '75001',
                skills: [],
                availability_days: ['tuesday'],
                preferences: ''
            };

            const mockCreatedVolunteer = {
                Volunteer_id: 11,
                User_id: 11,
                First_name: 'Simple',
                Last_name: 'User'
            };

            VolunteerModelDB.createVolunteer.mockResolvedValue(mockCreatedVolunteer);

            const response = await request(app)
                .post('/api/volunteers/db/profile')
                .send(profileData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(VolunteerSkillsModelDB.addMultipleSkills).not.toHaveBeenCalled();
        });

        test('should handle volunteer creation error', async () => {
            const profileData = {
                user_id: 1,
                full_name: 'Test User',
                phone_number: '(555) 123-4567',
                address_1: '123 Test St',
                city: 'Houston',
                state: 'TX',
                zip_code: '77001',
                skills: [],
                availability_days: ['monday']
            };

            VolunteerModelDB.createVolunteer.mockRejectedValue(
                new Error('User already has a volunteer profile')
            );

            const response = await request(app)
                .post('/api/volunteers/db/profile')
                .send(profileData);

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        });

        test('should handle skill addition error', async () => {
            const profileData = {
                user_id: 12,
                full_name: 'Error Test',
                phone_number: '(555) 111-2222',
                address_1: '789 Test Ave',
                city: 'Austin',
                state: 'TX',
                zip_code: '78701',
                skills: [{ Skills_id: 1, Experience_level: 'beginner', Date_acquired: '2024-01-01' }],
                availability_days: ['friday']
            };

            const mockCreatedVolunteer = { Volunteer_id: 12, User_id: 12 };

            VolunteerModelDB.createVolunteer.mockResolvedValue(mockCreatedVolunteer);
            VolunteerSkillsModelDB.addMultipleSkills.mockRejectedValue(new Error('Skill error'));

            const response = await request(app)
                .post('/api/volunteers/db/profile')
                .send(profileData);

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            // Note: No rollback implemented, so volunteer stays in DB
        });
    });

    describe('updateProfileDB', () => {
        test('should update profile and skills successfully', async () => {
            const updateData = {
                full_name: 'Updated Name',
                phone_number: '(555) 999-8888',
                address_1: '999 Updated St',
                city: 'Austin',
                state: 'TX',
                zip_code: '78701',
                skills: [
                    {
                        Skills_id: 2,
                        Experience_level: 'expert',
                        Date_acquired: '2024-06-01'
                    }
                ],
                availability_days: ['thursday', 'friday'],
                preferences: 'Afternoon shifts'
            };

            const mockUpdatedVolunteer = { 
                Volunteer_id: 1, 
                User_id: 1,
                First_name: 'Updated',
                Last_name: 'Name',
                City: 'Austin' 
            };

            VolunteerModelDB.updateVolunteerByUserId.mockResolvedValue(mockUpdatedVolunteer);
            VolunteerSkillsModelDB.deleteAllVolunteerSkills.mockResolvedValue({});
            VolunteerSkillsModelDB.addMultipleSkills.mockResolvedValue({});

            const response = await request(app)
                .put('/api/volunteers/db/profile')
                .query({ user_id: 1 })
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('updated successfully');
            expect(VolunteerSkillsModelDB.deleteAllVolunteerSkills).toHaveBeenCalledWith(1);
            expect(VolunteerSkillsModelDB.addMultipleSkills).toHaveBeenCalled();
        });

        test('should return 400 if user_id is missing', async () => {
            const response = await request(app)
                .put('/api/volunteers/db/profile')
                .send({ full_name: 'Test' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('user_id is required');
        });

        test('should handle update when volunteer not found', async () => {
            VolunteerModelDB.updateVolunteerByUserId.mockRejectedValue(
                new Error('Volunteer profile not found for this user')
            );

            const response = await request(app)
                .put('/api/volunteers/db/profile')
                .query({ user_id: 999 })
                .send({ full_name: 'Test' });

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        });

        test('should handle update error', async () => {
            VolunteerModelDB.updateVolunteerByUserId.mockRejectedValue(new Error('Update failed'));

            const response = await request(app)
                .put('/api/volunteers/db/profile')
                .query({ user_id: 1 })
                .send({ full_name: 'Test' });

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        });

        test('should update profile without changing skills', async () => {
            const updateData = {
                city: 'Dallas',
                phone_number: '(555) 777-8888'
            };

            const mockUpdatedVolunteer = { 
                Volunteer_id: 1, 
                User_id: 1,
                City: 'Dallas' 
            };

            VolunteerModelDB.updateVolunteerByUserId.mockResolvedValue(mockUpdatedVolunteer);

            const response = await request(app)
                .put('/api/volunteers/db/profile')
                .query({ user_id: 1 })
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            // Skills functions should not be called if skills not in request
            expect(VolunteerSkillsModelDB.deleteAllVolunteerSkills).not.toHaveBeenCalled();
        });
    });
});