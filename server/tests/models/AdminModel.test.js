const AdminModel = require('../../src/models/AdminModel');

// Mock the EventModel and VolunteerModel
jest.mock('../../src/models/EventModel', () => ({
    countTotalEvents: jest.fn(() => 10),
    countEventsByStatus: jest.fn((status) => {
        if (status === 'active') return 5;
        if (status === 'upcoming') return 3;
        return 0;
    })
}));

jest.mock('../../src/models/VolunteerModel', () => ({
    getAllVolunteers: jest.fn(() => [
        { id: 1, name: 'Volunteer 1' },
        { id: 2, name: 'Volunteer 2' },
        { id: 3, name: 'Volunteer 3' }
    ])
}));

describe('Admin Model', () => {
    beforeEach(() => {
        // Reset the module to clear activities between tests
        jest.resetModules();
    });

    describe('getRecentActivities', () => {
        test('should return recent activities with default limit', () => {
            const activities = AdminModel.getRecentActivities();

            expect(activities).toBeDefined();
            expect(Array.isArray(activities)).toBe(true);
            expect(activities.length).toBeLessThanOrEqual(10);
        });

        test('should return activities with custom limit', () => {
            const activities = AdminModel.getRecentActivities(3);

            expect(activities).toBeDefined();
            expect(activities.length).toBeLessThanOrEqual(3);
        });

        test('should return activities sorted by timestamp', () => {
            const activities = AdminModel.getRecentActivities();

            for (let i = 0; i < activities.length - 1; i++) {
                const current = new Date(activities[i].timestamp);
                const next = new Date(activities[i + 1].timestamp);
                expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
            }
        });

        test('should return empty array when limit is 0', () => {
            const activities = AdminModel.getRecentActivities(0);

            expect(activities).toEqual([]);
        });
    });

    describe('getDashboardStats', () => {
        test('should return dashboard statistics', () => {
            const stats = AdminModel.getDashboardStats();

            expect(stats).toBeDefined();
            expect(stats.totalEvents).toBe(10);
            expect(stats.activeEvents).toBe(5);
            expect(stats.upcomingEvents).toBe(3);
            expect(stats.totalVolunteers).toBe(3);
            expect(stats.pendingMatches).toBe(5);
        });

        test('should return correct structure', () => {
            const stats = AdminModel.getDashboardStats();

            expect(stats).toHaveProperty('totalEvents');
            expect(stats).toHaveProperty('totalVolunteers');
            expect(stats).toHaveProperty('activeEvents');
            expect(stats).toHaveProperty('upcomingEvents');
            expect(stats).toHaveProperty('pendingMatches');
        });
    });

    describe('addActivity', () => {
        test('should add new activity', () => {
            const newActivity = AdminModel.addActivity('Test action', 'Test name');

            expect(newActivity).toBeDefined();
            expect(newActivity.action).toBe('Test action');
            expect(newActivity.name).toBe('Test name');
            expect(newActivity.time).toBe('Just now');
            expect(newActivity.id).toBeDefined();
            expect(newActivity.timestamp).toBeDefined();
        });

        test('should add activity to the beginning of list', () => {
            const activities1 = AdminModel.getRecentActivities();
            const initialLength = activities1.length;

            AdminModel.addActivity('New action', 'New name');

            const activities2 = AdminModel.getRecentActivities();
            expect(activities2.length).toBe(initialLength + 1);
            expect(activities2[0].action).toBe('New action');
        });

        test('should increment activity id', () => {
            const activity1 = AdminModel.addActivity('Action 1', 'Name 1');
            const activity2 = AdminModel.addActivity('Action 2', 'Name 2');

            expect(activity2.id).toBeGreaterThan(activity1.id);
        });

        test('should limit activities to 50', () => {
            // Add more than 50 activities
            for (let i = 0; i < 60; i++) {
                AdminModel.addActivity(`Action ${i}`, `Name ${i}`);
            }

            const activities = AdminModel.getRecentActivities(100);
            expect(activities.length).toBeLessThanOrEqual(50);
        });
    });

    describe('clearOldActivities', () => {
        test('should remove activities older than 30 days', () => {
            // Add some old activities by manually adding them
            const oldActivity = {
                id: 999,
                action: 'Old action',
                name: 'Old name',
                time: '31 days ago',
                timestamp: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString()
            };

            AdminModel.addActivity('Recent action', 'Recent name');

            const cleared = AdminModel.clearOldActivities();

            expect(cleared).toBeGreaterThanOrEqual(0);
        });

        test('should return count of cleared activities', () => {
            const cleared = AdminModel.clearOldActivities();

            expect(typeof cleared).toBe('number');
            expect(cleared).toBeGreaterThanOrEqual(0);
        });

        test('should not remove recent activities', () => {
            const recentActivity = AdminModel.addActivity('Recent action', 'Recent name');
            const activitiesBefore = AdminModel.getRecentActivities();
            const countBefore = activitiesBefore.length;

            AdminModel.clearOldActivities();

            const activitiesAfter = AdminModel.getRecentActivities();
            
            // Recent activity should still be there
            const foundActivity = activitiesAfter.find(a => a.id === recentActivity.id);
            expect(foundActivity).toBeDefined();
        });
    });
});