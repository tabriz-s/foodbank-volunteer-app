
/*
Temporarily use mock auth for testing
When backend is ready, uncomment the real implementation below
export { useAuth, MockAuthProvider as AuthProvider } from './MockAuthContext';
*/


import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import axios from 'axios';

const AuthContext = createContext();

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Fetch user role from Firestore
  const fetchUserRole = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role);
        setUserProfile(userData);
        return userData.role;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  };

  // Register new user with role
  const signup = async (email, password, role = 'volunteer', displayName = '') => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name if provided
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Store user role and basic info in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: displayName,
        role: role,
        createdAt: new Date().toISOString(),
        profileCompleted: false
      });

      // Notify backend about new user
      try {
        await axios.post(`${API_BASE_URL}/auth/register`, {
          uid: user.uid,
          email: user.email,
          role: role,
          displayName: displayName
        });
      } catch (backendError) {
        console.error('Backend registration error:', backendError);
        // Continue even if backend fails - Firebase user is created
      }

      setUserRole(role);
      return userCredential;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore
      const role = await fetchUserRole(user.uid);

      // Get ID token for backend verification
      const idToken = await user.getIdToken();

      // Notify backend about login
      try {
        await axios.post(`${API_BASE_URL}/auth/login`, {
          uid: user.uid,
          email: user.email,
          idToken: idToken
        });
      } catch (backendError) {
        console.error('Backend login error:', backendError);
      }

      return { user, role };
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
      setUserProfile(null);
      
      // Clear backend session
      try {
        await axios.post(`${API_BASE_URL}/auth/logout`);
      } catch (backendError) {
        console.error('Backend logout error:', backendError);
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update user profile in Firestore
  const updateUserProfile = async (uid, profileData) => {
    try {
      await setDoc(doc(db, 'users', uid), {
        ...profileData,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Update backend
      const idToken = await auth.currentUser.getIdToken();
      await axios.put(`${API_BASE_URL}/users/profile`, profileData, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      setUserProfile(prev => ({ ...prev, ...profileData }));
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Get current user's ID token (for API calls)
  const getIdToken = async () => {
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    return null;
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return userRole === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(userRole);
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user role and profile when auth state changes
        await fetchUserRole(user.uid);
      } else {
        setUserRole(null);
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userProfile,
    loading,
    error,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    getIdToken,
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
