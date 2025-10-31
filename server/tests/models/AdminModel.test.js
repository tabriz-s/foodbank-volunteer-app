const AdminModel = require('../../src/models/AdminModel');

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
            expect(stats).toHaveProperty('pendingMatches');
        });

        test('all stats should be numbers', () => {
            const stats = AdminModel.getDashboardStats();

            expect(typeof stats.totalEvents).toBe('number');
            expect(typeof stats.totalVolunteers).toBe('number');
            expect(typeof stats.activeEvents).toBe('number');
            expect(typeof stats.upcomingEvents).toBe('number');
            expect(typeof stats.pendingMatches).toBe('number');
        });

        test('should have non-negative values', () => {
            const stats = AdminModel.getDashboardStats();

            expect(stats.totalEvents).toBeGreaterThanOrEqual(0);
            expect(stats.totalVolunteers).toBeGreaterThanOrEqual(0);
            expect(stats.activeEvents).toBeGreaterThanOrEqual(0);
            expect(stats.upcomingEvents).toBeGreaterThanOrEqual(0);
            expect(stats.pendingMatches).toBeGreaterThanOrEqual(0);
        });

        test('should calculate stats from models', () => {
            const stats = AdminModel.getDashboardStats();

            // Stats should be reasonable numbers
            expect(stats.totalEvents).toBeDefined();
            expect(stats.totalVolunteers).toBeDefined();
        });
    });
    
    describe('getRecentActivities', () => {
        test('should return an array of activities', () => {
            const activities = AdminModel.getRecentActivities();
            
            expect(Array.isArray(activities)).toBe(true);
        });

        test('should return default limit of 10 or less', () => {
            const activities = AdminModel.getRecentActivities();
            
            expect(activities.length).toBeLessThanOrEqual(10);
        });

        test('should respect custom limit', () => {
            const activities = AdminModel.getRecentActivities(3);
            
            expect(activities.length).toBeLessThanOrEqual(3);
        });

        test('should respect larger custom limit', () => {
            const activities = AdminModel.getRecentActivities(20);
            
            expect(activities.length).toBeLessThanOrEqual(20);
        });

        test('activities should have required fields', () => {
            const activities = AdminModel.getRecentActivities();
            
            if (activities.length > 0) {
                const activity = activities[0];
                expect(activity).toHaveProperty('id');
                expect(activity).toHaveProperty('action');
                expect(activity).toHaveProperty('name');
                expect(activity).toHaveProperty('time');
                expect(activity).toHaveProperty('timestamp');
            }
        });

        test('activities should be sorted by timestamp descending', () => {
            const activities = AdminModel.getRecentActivities();
            
            for (let i = 1; i < activities.length; i++) {
                const prevTimestamp = new Date(activities[i-1].timestamp);
                const currTimestamp = new Date(activities[i].timestamp);
                expect(prevTimestamp >= currTimestamp).toBe(true);
            }
        });

        test('should handle limit of 0', () => {
            const activities = AdminModel.getRecentActivities(0);
            
            expect(activities).toHaveLength(0);
        });

        test('should handle limit of 1', () => {
            const activities = AdminModel.getRecentActivities(1);
            
            expect(activities.length).toBeLessThanOrEqual(1);
        });

        test('each activity should have valid timestamp', () => {
            const activities = AdminModel.getRecentActivities();
            
            activities.forEach(activity => {
                const date = new Date(activity.timestamp);
                expect(date.toString()).not.toBe('Invalid Date');
            });
        });

        test('activity IDs should be unique', () => {
            const activities = AdminModel.getRecentActivities();
            const ids = activities.map(a => a.id);
            const uniqueIds = [...new Set(ids)];
            
            expect(ids.length).toBe(uniqueIds.length);
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

        test('should add activity to the beginning of list', () => {
            const newActivity = AdminModel.addActivity('Newest action', 'New user');
            const activities = AdminModel.getRecentActivities();
            
            expect(activities[0].id).toBe(newActivity.id);
        });

        test('should generate unique IDs for activities', () => {
            const activity1 = AdminModel.addActivity('Action 1', 'Name 1');
            const activity2 = AdminModel.addActivity('Action 2', 'Name 2');
            
            expect(activity1.id).not.toBe(activity2.id);
        });

        test('should set timestamp to current time', () => {
            const beforeTime = new Date();
            const newActivity = AdminModel.addActivity('Test', 'Test');
            const afterTime = new Date();
            
            const activityTime = new Date(newActivity.timestamp);
            expect(activityTime >= beforeTime && activityTime <= afterTime).toBe(true);
        });

        test('should handle special characters in action', () => {
            const newActivity = AdminModel.addActivity('Test <action>', 'Test & Name');
            
            expect(newActivity.action).toBe('Test <action>');
            expect(newActivity.name).toBe('Test & Name');
        });

        test('should handle empty strings', () => {
            const newActivity = AdminModel.addActivity('', '');
            
            expect(newActivity.action).toBe('');
            expect(newActivity.name).toBe('');
        });

        test('should limit activities to 50', () => {
            // Add 60 activities
            for (let i = 0; i < 60; i++) {
                AdminModel.addActivity(`Action ${i}`, `Name ${i}`);
            }
            
            const activities = AdminModel.getRecentActivities(100);
            expect(activities.length).toBeLessThanOrEqual(50);
        });

        test('should return the created activity', () => {
            const newActivity = AdminModel.addActivity('Return test', 'Return name');
            
            expect(newActivity).toBeDefined();
            expect(typeof newActivity).toBe('object');
        });
    });

    describe('clearOldActivities', () => {
        test('should return number of cleared activities', () => {
            const cleared = AdminModel.clearOldActivities();
            
            expect(typeof cleared).toBe('number');
            expect(cleared).toBeGreaterThanOrEqual(0);
        });

        test('should not clear recent activities', () => {
            // Add a new activity
            AdminModel.addActivity('Recent', 'Recent');
            
            const activitiesBefore = AdminModel.getRecentActivities();
            const cleared = AdminModel.clearOldActivities();
            const activitiesAfter = AdminModel.getRecentActivities();
            
            // Should not clear the recent one
            expect(activitiesBefore.length - cleared).toBeLessThanOrEqual(activitiesAfter.length);
        });

        test('should clear activities older than 30 days', () => {
            const cleared = AdminModel.clearOldActivities();
            const remainingActivities = AdminModel.getRecentActivities(100);
            
            // All remaining activities should be within 30 days
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            remainingActivities.forEach(activity => {
                const activityDate = new Date(activity.timestamp);
                expect(activityDate >= thirtyDaysAgo).toBe(true);
            });
        });

        test('should handle when no old activities exist', () => {
            // Clear once
            AdminModel.clearOldActivities();
            
            // Clear again should return 0
            const cleared = AdminModel.clearOldActivities();
            expect(cleared).toBe(0);
        });

        test('should return difference in count', () => {
            const activitiesBefore = AdminModel.getRecentActivities(100).length;
            const cleared = AdminModel.clearOldActivities();
            const activitiesAfter = AdminModel.getRecentActivities(100).length;
            
            expect(cleared).toBe(activitiesBefore - activitiesAfter);
        });
    });
});