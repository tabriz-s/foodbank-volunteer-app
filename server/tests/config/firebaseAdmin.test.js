/**
 * @file firebaseAdmin.test.js
 * Tests Firebase Admin initialization logic and mock fallback
 */

jest.mock('firebase-admin', () => ({
    initializeApp: jest.fn(),
    credential: { cert: jest.fn((x) => x) },
}));

describe('firebase-admin.js', () => {
    beforeEach(() => {
        jest.resetModules();
        process.env = {}; // clear env vars
    });

    test('initializes Firebase Admin SDK with service account JSON', () => {
        const mockAdmin = require('firebase-admin');
        const serviceKey = JSON.stringify({
            type: 'service_account',
            project_id: 'volunteer-generosity',
        });

        process.env.FIREBASE_SERVICE_ACCOUNT_KEY = serviceKey;
        process.env.FIREBASE_PROJECT_ID = 'volunteer-generosity';

        require('../../src/config/firebase-admin');

        expect(mockAdmin.credential.cert).toHaveBeenCalledWith(
            expect.objectContaining({ project_id: 'volunteer-generosity' })
        );
        expect(mockAdmin.initializeApp).toHaveBeenCalled();
    });

    test('initializes using individual environment variables', () => {
        const mockAdmin = require('firebase-admin');
        process.env.FIREBASE_PROJECT_ID = 'volunteer-generosity';
        process.env.FIREBASE_CLIENT_EMAIL = 'admin@test.com';
        process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----fakekey-----END PRIVATE KEY-----\\n';

        require('../../src/config/firebase-admin');
        expect(mockAdmin.initializeApp).toHaveBeenCalled();
    });

    test('falls back to mock mode in development without Firebase config', async () => {
        process.env.NODE_ENV = 'development';
        process.env.FIREBASE_PROJECT_ID = ''; // forces mock path
        jest.resetModules();

        const mockConsole = jest.spyOn(console, 'log').mockImplementation(() => {});
        const firebase = require('../../src/config/firebase-admin');

        expect(firebase.auth).toBeDefined();
        expect(typeof firebase.auth().verifyIdToken).toBe('function');

        const volunteer = await firebase.auth().verifyIdToken('mock-token-volunteer');
        expect(volunteer.email).toBe('volunteer@test.com');

        const adminUser = await firebase.auth().verifyIdToken('mock-token-admin');
        expect(adminUser.email).toBe('admin@test.com');

        // Invalid token should throw
        await expect(firebase.auth().verifyIdToken('invalid')).rejects.toThrow('Invalid mock token');

        mockConsole.mockRestore();
    });
});
