import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// This hook MUST match the real AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const MockAuthProvider = ({ children }) => {
  // Mock logged-in as User 1 (Michael Pearson)
  const [currentUser] = useState({
    uid: 'mock-firebase-uid-1',
    email: 'michael.pearson@email.com'
  });
  
  const [userId] = useState(1);  // ← Testing with User 1
  const [userRole] = useState('volunteer');
  const [userProfile] = useState(null);
  const [loading] = useState(false);
  const [error] = useState(null);

  const value = {
    currentUser,
    userId,
    userRole,
    userProfile,
    loading,
    error,
    signup: async (email, password, role, displayName) => {
      console.log('Mock signup called:', email, role);
      return Promise.resolve({ user: currentUser, role, userId, profileCompleted: false });
    },
    login: async (email, password) => {
      console.log('Mock login called:', email);
      return Promise.resolve({ user: currentUser, role: userRole });
    },
    logout: async () => {
      console.log('Mock logout called');
      return Promise.resolve();
    },
    resetPassword: async (email) => {
      console.log('Mock reset password called:', email);
      return Promise.resolve();
    },
    updateUserProfile: async (uid, profileData) => {
      console.log('Mock update profile called:', uid, profileData);
      return Promise.resolve();
    },
    getIdToken: async () => {
      console.log('Mock getIdToken called');
      return Promise.resolve('mock-token');
    },
    hasRole: (role) => {
      return role === userRole;
    },
    hasAnyRole: (roles) => {
      return roles.includes(userRole);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Also export AuthProvider as an alias for compatibility
export const AuthProvider = MockAuthProvider;

export default AuthContext;