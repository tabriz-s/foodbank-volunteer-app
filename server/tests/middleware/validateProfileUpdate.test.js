const { validateProfileUpdate } = require('../../src/middleware/VolunteerMiddleware');

describe('validateProfileUpdate Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe('Valid partial updates', () => {
        test('should pass with only city update', () => {
            req.body = { city: 'Houston' };
            
            validateProfileUpdate(req, res, next);
            
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should pass with only phone number update', () => {
            req.body = { phone_number: '(555) 123-4567' };
            
            validateProfileUpdate(req, res, next);
            
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should pass with multiple valid fields', () => {
            req.body = {
                city: 'Dallas',
                state: 'TX',
                zip_code: '75001'
            };
            
            validateProfileUpdate(req, res, next);
            
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should pass with valid availability_days', () => {
            req.body = {
                availability_days: ['monday', 'wednesday', 'friday']
            };
            
            validateProfileUpdate(req, res, next);
            
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should pass with valid skills array', () => {
            req.body = {
                skills: [
                    {
                        Skills_id: 1,
                        Experience_level: 'beginner',
                        Date_acquired: '2024-01-15'
                    }
                ]
            };
            
            validateProfileUpdate(req, res, next);
            
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should pass with empty body (no fields to update)', () => {
            req.body = {};
            
            validateProfileUpdate(req, res, next);
            
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });
    });

    describe('Invalid updates', () => {
        test('should fail with empty full_name', () => {
            req.body = { full_name: '' };
            
            validateProfileUpdate(req, res, next);
            
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    errors: expect.arrayContaining([
                        expect.stringContaining('Full name cannot be empty')
                    ])
                })
            );
        });

        test('should fail with invalid phone number format', () => {
            req.body = { phone_number: '1234567890' };
            
            validateProfileUpdate(req, res, next);
            
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    errors: expect.arrayContaining([
                        expect.stringContaining('Phone number must be in format')
                    ])
                })
            );
        });

        test('should fail with invalid state code', () => {
            req.body = { state: 'Texas' };
            
            validateProfileUpdate(req, res, next);
            
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    errors: expect.arrayContaining([
                        expect.stringContaining('State must be a 2-letter code')
                    ])
                })
            );
        });

        test('should fail with invalid zip code format', () => {
            req.body = { zip_code: '1234' };
            
            validateProfileUpdate(req, res, next);
            
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should fail with empty availability_days array', () => {
            req.body = { availability_days: [] };
            
            validateProfileUpdate(req, res, next);
            
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    errors: expect.arrayContaining([
                        expect.stringContaining('must be a non-empty array')
                    ])
                })
            );
        });

        test('should fail with invalid day of week', () => {
            req.body = { availability_days: ['monday', 'funday'] };
            
            validateProfileUpdate(req, res, next);
            
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    errors: expect.arrayContaining([
                        expect.stringContaining('Invalid days')
                    ])
                })
            );
        });

        test('should fail with skills missing Skills_id', () => {
            req.body = {
                skills: [
                    {
                        Experience_level: 'beginner',
                        Date_acquired: '2024-01-15'
                    }
                ]
            };
            
            validateProfileUpdate(req, res, next);
            
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    errors: expect.arrayContaining([
                        expect.stringContaining('Skills_id must be an integer')
                    ])
                })
            );
        });

        test('should fail with invalid experience level', () => {
            req.body = {
                skills: [
                    {
                        Skills_id: 1,
                        Experience_level: 'master',
                        Date_acquired: '2024-01-15'
                    }
                ]
            };
            
            validateProfileUpdate(req, res, next);
            
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should fail with invalid date format', () => {
            req.body = {
                skills: [
                    {
                        Skills_id: 1,
                        Experience_level: 'beginner',
                        Date_acquired: '01/15/2024'
                    }
                ]
            };
            
            validateProfileUpdate(req, res, next);
            
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    errors: expect.arrayContaining([
                        expect.stringContaining('Date_acquired must be in YYYY-MM-DD format')
                    ])
                })
            );
        });

        test('should fail with multiple validation errors', () => {
            req.body = {
                city: '',
                state: 'Texas',
                zip_code: '123'
            };
            
            validateProfileUpdate(req, res, next);
            
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    errors: expect.arrayContaining([
                        expect.stringContaining('City cannot be empty'),
                        expect.stringContaining('State must be a 2-letter code'),
                        expect.stringContaining('Zip code must be in format')
                    ])
                })
            );
        });
    });
});