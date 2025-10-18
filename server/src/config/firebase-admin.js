const admin = require('firebase-admin');

// For development: Use .env variables
// For production: Use service account JSON file
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  // Parse JSON string from .env variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} else {
  // Use individual .env variables
  serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
  };
}

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
  
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error.message);
  console.log('Firebase authentication will not work until you configure it properly lol');
  
  // For without Firebase setup, create a mock admin object
  if (process.env.NODE_ENV === 'development' && !process.env.FIREBASE_PROJECT_ID) {
    console.log('🔧 Running in mock Firebase mode for development');
    
    // Mock Firebase Admin for development
    const mockAdmin = {
      auth: () => ({
        verifyIdToken: async (token) => {
          // Mock token verification for development
          if (token === 'mock-token-volunteer') {
            return { uid: 'mock-volunteer-uid', email: 'volunteer@test.com' };
          }
          if (token === 'mock-token-employee') {
            return { uid: 'mock-employee-uid', email: 'employee@test.com' };
          }
          if (token === 'mock-token-admin') {
            return { uid: 'mock-admin-uid', email: 'admin@test.com' };
          }
          throw new Error('Invalid mock token');
        },
        getUserByEmail: async (email) => {
          return { uid: `mock-uid-${email}`, email };
        }
      })
    };
    
    module.exports = mockAdmin;
  }
}

module.exports = admin;