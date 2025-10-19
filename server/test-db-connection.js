const { testConnection } = require('./src/config/database');

async function test() {
    console.log('🔍 Testing Azure MySQL Database connection...');
    const success = await testConnection();
    
    if (success) {
        console.log('Success! MySQL Database is connected.');
    } else {
        console.log('Failed to connect. Check your credentials.');
    }
    
    process.exit(0);
}

test();