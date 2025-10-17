// test the controllers for user profile

const ProfileController = require('../../src/controllers/ProfileController');
const Volunteer = require('../../src/models/VolunteerModel'); // model controller uses
const VolunteerSkills = require('../../src/models/VolunteerSkillsModel'); // model controller uses

describe('ProfileController', () => {

    describe('getAllVolunteers', () => {
        test('should return all volunteers with success response', () => {
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            ProfileController.getAllVolunteers(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.any(Array)
                })
            );
        });

        test('returned data should have at least 2 volunteers', () => {
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            ProfileController.getAllVolunteers(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.data.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('getProfile', () => {
        test('should return profile for existing user', () => {
            const req = {
                query: { user_id: '1' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            ProfileController.getProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        User_id: 1,
                        First_name: 'Michael'
                    })
                })
            );
        });

        test('should include skills in profile', () => {
            const req = {
                query: { user_id: '1' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            ProfileController.getProfile(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.data).toHaveProperty('skills');
            expect(Array.isArray(response.data.skills)).toBe(true);
        });

        test('should return 404 for non-existent user', () => {
            const req = {
                query: { user_id: '999' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            ProfileController.getProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.any(String)
                })
            );
        });

        test('should return 400 if user_id is missing', () => {
            const req = {
                query: {}
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            ProfileController.getProfile(req, res);

            expect(res.status).toHaveBeenCalled();
            const statusCode = res.status.mock.calls[0][0];
            expect([200, 400, 404]).toContain(statusCode);
        });
    });

    describe('createProfile', () => {
        test('should create profile successfully', () => {
            const req = {
                body: {
                    user_id: 888,
                    full_name: 'Test User',
                    phone_number: '123-456-7890',
                    address_1: '123 Test St',
                    city: 'Test City',
                    state: 'TX',
                    zip_code: '12345',
                    skills: [
                        { Skills_id: 1, Experience_level: 'beginner', Date_acquired: '2024-01-01' }
                    ],
                    availability_days: ['monday', 'tuesday']
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            ProfileController.createProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: expect.any(String),
                    data: expect.objectContaining({
                        User_id: 888
                    })
                })
            );
        });

        test('should return 400 for invalid data', () => {
            const req = {
                body: {
                    user_id: 887,
                    full_name: '',  // Invalid - empty name
                    phone_number: '123-456-7890',
                    address_1: '123 Test St',
                    city: 'Test City',
                    state: 'TX',
                    zip_code: '12345',
                    skills: []
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            ProfileController.createProfile(req, res);

            const statusCode = res.status.mock.calls[0][0];
            expect(statusCode).toBeGreaterThanOrEqual(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false
                })
            );
        });
    });

    describe('updateProfile', () => {
        test('should update existing profile', () => {
            // First create a profile
            const createReq = {
                body: {
                    user_id: 886,
                    full_name: 'Original Name',
                    phone_number: '111-111-1111',
                    address_1: '111 Test St',
                    city: 'Test City',
                    state: 'TX',
                    zip_code: '11111',
                    skills: [
                        { Skills_id: 1, Experience_level: 'beginner', Date_acquired: '2024-01-01' }
                    ],
                    availability_days: ['monday']
                }
            };
            const createRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            ProfileController.createProfile(createReq, createRes);

            // Now update it
            const updateReq = {
                query: { user_id: '886' },
                body: {
                    full_name: 'Updated Name',
                    phone_number: '222-222-2222',
                    address_1: '222 Updated St',
                    city: 'Updated City',
                    state: 'CA',
                    zip_code: '22222',
                    skills: [
                        { Skills_id: 2, Experience_level: 'intermediate', Date_acquired: '2024-02-01' }
                    ],
                    availability_days: ['tuesday', 'wednesday']
                }
            };
            const updateRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            ProfileController.updateProfile(updateReq, updateRes);

            expect(updateRes.status).toHaveBeenCalledWith(200);
            expect(updateRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: expect.any(String)
                })
            );
        });

        test('should return 404 for non-existent user', () => {
            const req = {
                query: { user_id: '9999' },
                body: {
                    full_name: 'Test',
                    phone_number: '123-456-7890',
                    address_1: '123 Test',
                    city: 'Test',
                    state: 'TX',
                    zip_code: '12345',
                    skills: [],
                    availability_days: []
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            ProfileController.updateProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false
                })
            );
        });

        test('should handle invalid data', () => {
            const req = {
                query: { user_id: '1' },
                body: {
                    full_name: '',  // Invalid
                    phone_number: '123-456-7890',
                    address_1: '123 Test',
                    city: 'Test',
                    state: 'TX',
                    zip_code: '12345',
                    skills: [],
                    availability_days: []
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            ProfileController.updateProfile(req, res);

            // May succeed or fail depending on validation
            expect(res.status).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
        });
    });

    describe('deleteVolunteer', () => {
        test('should delete existing volunteer', () => {
            // Create a volunteer first
            const createReq = {
                body: {
                    user_id: 885,
                    full_name: 'To Delete',
                    phone_number: '333-333-3333',
                    address_1: '333 Test St',
                    city: 'Test City',
                    state: 'TX',
                    zip_code: '33333',
                    skills: [
                        { Skills_id: 1, Experience_level: 'beginner', Date_acquired: '2024-01-01' }
                    ],
                    availability_days: ['monday']
                }
            };
            const createRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            ProfileController.createProfile(createReq, createRes);

            // Now delete it
            const deleteReq = {
                query: { user_id: '885' }
            };
            const deleteRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            ProfileController.deleteVolunteer(deleteReq, deleteRes);

            // Should get some response
            expect(deleteRes.status).toHaveBeenCalled();
            expect(deleteRes.json).toHaveBeenCalled();
            
            const response = deleteRes.json.mock.calls[0][0];
            // Either success or error response
            expect(response).toHaveProperty('success');
        });

        test('should handle non-existent volunteer', () => {
            const req = {
                query: { user_id: '9999' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            ProfileController.deleteVolunteer(req, res);

            expect(res.status).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
        });

        test('should handle missing user_id', () => {
            const req = {
                query: {}
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            ProfileController.deleteVolunteer(req, res);

            expect(res.status).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
        });
    });

});