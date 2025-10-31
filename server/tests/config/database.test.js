const mysql = require('mysql2/promise');
const database = require('../../src/config/database');

// Mock mysql2 promise
jest.mock('mysql2/promise');

describe('database', () => {
    let mockPool;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Turn off console logs during tests
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
        
        // Create mock pool;
        mockPool = {
            query: jest.fn(),
            end: jest.fn()
        };
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    describe('getConnection', () => {
        test('should create and return connection pool on first call', async () => {
            mysql.createPool.mockReturnValue(mockPool);

            const connection = await database.getConnection();

            expect(mysql.createPool).toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith('Connected to Azure MySQL Database');
            expect(connection).toBe(mockPool);
        });

        test('should return existing pool on subsequent calls', async () => {
            mysql.createPool.mockReturnValue(mockPool);

            const connection1 = await database.getConnection();
            const connection2 = await database.getConnection();

            expect(mysql.createPool).toHaveBeenCalledTimes(1);
            expect(connection1).toBe(connection2);
        });

        test('should handle connection errors', async () => {
            const mockError = new Error('Connection failed');
            mysql.createPool.mockImplementation(() => {
                throw mockError;
            });

            await expect(database.getConnection()).rejects.toThrow('Connection failed');
            expect(console.error).toHaveBeenCalledWith('Database connection failed:', mockError.message);
        });

        test('should create pool with correct config', async () => {
            mysql.createPool.mockReturnValue(mockPool);

            await database.getConnection();

            expect(mysql.createPool).toHaveBeenCalledWith(
                expect.objectContaining({
                    host: expect.any(String),
                    user: expect.any(String),
                    database: expect.any(String),
                    waitForConnections: true,
                    connectionLimit: 10,
                    queueLimit: 0
                })
            );
        });
    });

    describe('testConnection', () => {
        test('should return true when connection test succeeds', async () => {
            mysql.createPool.mockReturnValue(mockPool);
            mockPool.query.mockResolvedValue([[{ test: 1 }]]);

            const result = await database.testConnection();

            expect(result).toBe(true);
            expect(mockPool.query).toHaveBeenCalledWith('SELECT 1 AS test');
            expect(console.log).toHaveBeenCalledWith('Database connection test successful');
        });

        test('should return false when connection test fails', async () => {
            const mockError = new Error('Test query failed');
            mysql.createPool.mockReturnValue(mockPool);
            mockPool.query.mockRejectedValue(mockError);

            const result = await database.testConnection();

            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalledWith('Database connection test failed:', mockError.message);
        });

        test('should return false when pool creation fails', async () => {
            mysql.createPool.mockImplementation(() => {
                throw new Error('Pool creation failed');
            });

            const result = await database.testConnection();

            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalled();
        });

        test('should execute SELECT 1 test query', async () => {
            mysql.createPool.mockReturnValue(mockPool);
            mockPool.query.mockResolvedValue([[{ test: 1 }]]);

            await database.testConnection();

            expect(mockPool.query).toHaveBeenCalledWith('SELECT 1 AS test');
        });
    });

    describe('closeConnection', () => {
        test('should close pool when it exists', async () => {
            mysql.createPool.mockReturnValue(mockPool);
            mockPool.end.mockResolvedValue();

            // First create a connection
            await database.getConnection();

            // Then close it
            await database.closeConnection();

            expect(mockPool.end).toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith('Database connection closed');
        });

        test('should do nothing when pool does not exist', async () => {
            await database.closeConnection();

            // Should not throw error
            expect(console.log).not.toHaveBeenCalledWith('Database connection closed');
        });

        test('should handle errors during close', async () => {
            mysql.createPool.mockReturnValue(mockPool);
            const mockError = new Error('Close failed');
            mockPool.end.mockRejectedValue(mockError);

            // Create connection first
            await database.getConnection();

            // Try to close
            await database.closeConnection();

            expect(console.error).toHaveBeenCalledWith('Error closing database connection:', mockError);
        });

        test('should set pool to null after closing', async () => {
            mysql.createPool.mockReturnValue(mockPool);
            mockPool.end.mockResolvedValue();

            await database.getConnection();
            await database.closeConnection();

            // Getting connection again should create new pool
            await database.getConnection();

            expect(mysql.createPool).toHaveBeenCalledTimes(2);
        });

        test('should not error if called multiple times', async () => {
            await database.closeConnection();
            await database.closeConnection();
            await database.closeConnection();

            // Should not throw
            expect(true).toBe(true);
        });
    });

    describe('integration scenarios', () => {
        test('should handle full connection lifecycle', async () => {
            mysql.createPool.mockReturnValue(mockPool);
            mockPool.query.mockResolvedValue([[{ test: 1 }]]);
            mockPool.end.mockResolvedValue();

            // Get connection
            const conn = await database.getConnection();
            expect(conn).toBe(mockPool);

            // Test connection
            const testResult = await database.testConnection();
            expect(testResult).toBe(true);

            // Close connection
            await database.closeConnection();
            expect(mockPool.end).toHaveBeenCalled();
        });

        test('should recover from connection errors', async () => {
            // First attempt fails
            mysql.createPool.mockImplementationOnce(() => {
                throw new Error('First connection failed');
            });

            await expect(database.getConnection()).rejects.toThrow();

            // Second attempt succeeds
            mysql.createPool.mockReturnValue(mockPool);
            const conn = await database.getConnection();
            expect(conn).toBe(mockPool);
        });
    });
});