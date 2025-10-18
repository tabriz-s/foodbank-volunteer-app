const AdminController = require('../../src/controllers/AdminController');
describe('AdminController', () => {
    describe('getDashboardStats', () => {
        test('should return dashboard stats', async () => {
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AdminController.getDashboardStats(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.any(Object)
                })
            );
        });

        test('should return all required stats', async () => {
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AdminController.getDashboardStats(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.data).toHaveProperty('totalEvents');
            expect(response.data).toHaveProperty('totalVolunteers');
            expect(response.data).toHaveProperty('activeEvents');
            expect(response.data).toHaveProperty('upcomingEvents');
        });
    });
    describe('getRecentActivities', () => {
        test('should return recent activities', async () => {
            const req = { query: {} };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AdminController.getRecentActivities(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.any(Array)
                })
            );
        });

        test('should respect limit parameter', async () => {
            const req = { query: { limit: '3' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await AdminController.getRecentActivities(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.data.length).toBeLessThanOrEqual(3);
        });
    });
});