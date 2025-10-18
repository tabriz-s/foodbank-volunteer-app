module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',           // Exclude app.js (just Express setup)
    '!src/server.js',        // Exclude server.js (just starts server)
    ],
    testMatch: [
    '**/tests/**/*.test.js'
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    }
};