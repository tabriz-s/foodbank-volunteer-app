const AdminModel = require('../src/models/AdminModel');
describe('AdminModel', () => {
    describe('getDashboardStats', () => {
        test('should return an object with stats', () => {
            const stats = AdminModel.getDashboardStats();
            
            expect(typeof stats).toBe('object');
            expect(stats).not.toBeNull();
        });

        test('should return all required fields', () => {
            const stats = AdminModel.getDashboardStats();

            expect(stats).toHaveProperty('totalEvents');
            expect(stats).toHaveProperty('totalVolunteers');
            expect(stats).toHaveProperty('activeEvents');
            expect(stats).toHaveProperty('upcomingEvents');
        });

        test('all stats should be numbers', () => {
            const stats = AdminModel.getDashboardStats();

            expect(typeof stats.totalEvents).toBe('number');
            expect(typeof stats.totalVolunteers).toBe('number');
            expect(typeof stats.activeEvents).toBe('number');
            expect(typeof stats.upcomingEvents).toBe('number');
        });
    });
    
    describe('getRecentActivities', () => {
        test('should return an array of activities', () => {
            const activities = AdminModel.getRecentActivities();
            
            expect(Array.isArray(activities)).toBe(true);
        });

        test('should respect custom limit', () => {
            const activities = AdminModel.getRecentActivities(3);
            
            expect(activities.length).toBeLessThanOrEqual(3);
        });

        test('activities should have required fields', () => {
            const activities = AdminModel.getRecentActivities();
            
            if (activities.length > 0) {
                const activity = activities[0];
                expect(activity).toHaveProperty('id');
                expect(activity).toHaveProperty('action');
                expect(activity).toHaveProperty('timestamp');
            }
        });
    });

    describe('addActivity', () => {
        test('should add a new activity', () => {
            const newActivity = AdminModel.addActivity('Test action', 'Test name');

            expect(newActivity).toHaveProperty('id');
            expect(newActivity.action).toBe('Test action');
            expect(newActivity.name).toBe('Test name');
            expect(newActivity.time).toBe('Just now');
        });
    });
});