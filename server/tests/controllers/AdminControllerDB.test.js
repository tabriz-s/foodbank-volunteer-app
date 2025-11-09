const { getDashboardStatsDB, getRecentActivitiesDB } = require('../../src/controllers/AdminControllerDB');
const EventDB = require('../../src/models/EventModelDB');
const VolunteerDB = require('../../src/models/VolunteerModelDB');

// Mock the database models
jest.mock('../../src/models/EventModelDB');
jest.mock('../../src/models/VolunteerModelDB');

describe('Admin Controller DB', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getDashboardStatsDB', () => {
        test('should return dashboard stats successfully', async () => {
            EventDB.countTotalEvents.mockResolvedValue(25);
            EventDB.countEventsByStatus.mockResolvedValueOnce(10).mockResolvedValueOnce(8);
            VolunteerDB.getAllVolunteers.mockResolvedValue([
                { id: 1, name: 'Volunteer 1' },
                { id: 2, name: 'Volunteer 2' },
                { id: 3, name: 'Volunteer 3' }
            ]);

            await getDashboardStatsDB(req, res);

            expect(EventDB.countTotalEvents).toHaveBeenCalled();
            expect(EventDB.countEventsByStatus).toHaveBeenCalledWith('active');
            expect(EventDB.countEventsByStatus).toHaveBeenCalledWith('planned');
            expect(VolunteerDB.getAllVolunteers).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                source: 'Azure MySQL Database',
                data: {
                    totalEvents: 25,
                    totalVolunteers: 3,
                    activeEvents: 10,
                    upcomingEvents: 8,
                    pendingMatches: 5
                }
            });
        });

        test('should handle when there are no events', async () => {
            EventDB.countTotalEvents.mockResolvedValue(0);
            EventDB.countEventsByStatus.mockResolvedValue(0);
            VolunteerDB.getAllVolunteers.mockResolvedValue([]);

            await getDashboardStatsDB(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                source: 'Azure MySQL Database',
                data: {
                    totalEvents: 0,
                    totalVolunteers: 0,
                    activeEvents: 0,
                    upcomingEvents: 0,
                    pendingMatches: 5
                }
            });
        });

        test('should handle database error when counting events', async () => {
            EventDB.countTotalEvents.mockRejectedValue(new Error('Database connection failed'));

            await getDashboardStatsDB(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to retrieve dashboard stats from database',
                error: 'Database connection failed'
            });
        });

        test('should handle error when getting volunteers', async () => {
            EventDB.countTotalEvents.mockResolvedValue(10);
            EventDB.countEventsByStatus.mockResolvedValue(5);
            VolunteerDB.getAllVolunteers.mockRejectedValue(new Error('Failed to fetch volunteers'));

            await getDashboardStatsDB(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to retrieve dashboard stats from database',
                error: 'Failed to fetch volunteers'
            });
        });
    });

    describe('getRecentActivitiesDB', () => {
        test('should return recent activities with default limit', async () => {
            await getRecentActivitiesDB(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                source: 'Azure MySQL Database',
                count: 2,
                data: expect.arrayContaining([
                    expect.objectContaining({ id: 1, action: 'New volunteer registered' }),
                    expect.objectContaining({ id: 2, action: 'Event created' })
                ])
            });
        });

        test('should return activities with custom limit', async () => {
            req.query.limit = '1';

            await getRecentActivitiesDB(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                source: 'Azure MySQL Database',
                count: 2,
                data: expect.arrayContaining([
                    expect.objectContaining({ id: 1 })
                ])
            });
            expect(res.json.mock.calls[0][0].data.length).toBe(1);
        });

        test('should handle limit of 0', async () => {
            req.query.limit = '0';

            await getRecentActivitiesDB(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json.mock.calls[0][0].data.length).toBe(0);
        });

        test('should handle large limit', async () => {
            req.query.limit = '100';

            await getRecentActivitiesDB(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json.mock.calls[0][0].data.length).toBe(2);
        });

        test('should handle error in getRecentActivitiesDB', async () => {
            req.query = null;

            await getRecentActivitiesDB(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Failed to retrieve recent activities from database',
                error: expect.any(String)
            });
        });
    });
});