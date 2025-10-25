// Exporting a mock 
module.exports = {
  auth: () => ({
    verifyIdToken: async (token) => {
      // Mock token verification 
      if (token === 'mock-token-volunteer') {
        return {
          uid: 'volunteer-uid',
          email: 'volunteer@test.com',
          email_verified: true
        };
      }
      if (token === 'mock-token-admin') {
        return {
          uid: 'admin-uid',
          email: 'admin@test.com',
          email_verified: true
        };
      }
      // Default
      return {
        uid: 'test-uid',
        email: 'test@test.com',
        email_verified: true
      };
    },
    getUserByEmail: async (email) => {
      return {
        uid: `uid-${email}`,
        email: email
      };
    }
  })
};

console.log('Using mock Firebase Admin SDK for testing');