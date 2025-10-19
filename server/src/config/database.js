const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: true},
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool = null;

// get or create connection pool
async function getConnection() {
    try {
        if (!pool) {
            pool = mysql.createPool(dbConfig);
            console.log('Connected to Azure MySQL Database');
        }
        return pool;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        throw error;
    }
}

// Test connection
async function testConnection() {
    try {
        const connection = await getConnection();
        const [rows] = await connection.query('SELECT 1 AS test');
        console.log('Database connection test successful');
        return true;
    } catch (error) {
        console.error('Database connection test failed:', error.message);
        return false;
    }
}

// Close connection pool
async function closeConnection() {
    try {
        if (pool) {
            await pool.end();
            pool = null;
            console.log('Database connection closed');
        }
    } catch (error) {
        console.error('Error closing database connection:', error);
    }
}

module.exports = {
    getConnection,
    closeConnection,
    testConnection
};