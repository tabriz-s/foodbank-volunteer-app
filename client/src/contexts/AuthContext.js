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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userId, setUserId] = useState(null); // MySQL User_id
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [profileCompleted, setProfileCompleted] = useState(false);
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
      // Step 1: Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name if provided
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Step 2: Store user role in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: displayName,
        role: role,
        createdAt: new Date().toISOString(),
        profileCompleted: false
      });

      // Step 3: Sync to backend (Azure MySQL)
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, {
          uid: user.uid,
          email: user.email,
          password: password, // Backend will hash it
          role: role,
          displayName: displayName
        });

        if (response.data.success) {
          console.log('User synced to database:', response.data.user);
          setUserId(response.data.user.id); // Store MySQL User_id
        }
      } catch (backendError) {
        console.error('Backend registration error:', backendError);
        // If backend fails, delete Firebase user to maintain consistency
        await user.delete();
        throw new Error('Failed to sync with database');
      }

      setUserRole(role);
      setProfileCompleted(false);
      
      return userCredential;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      // Step 1: Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 2: Fetch user role from Firestore
      const role = await fetchUserRole(user.uid);

      // Step 3: Get ID token for backend verification
      const idToken = await user.getIdToken();

      // Step 4: Notify backend and get user data
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          uid: user.uid,
          email: user.email,
          password: password,
          idToken: idToken
        });

        if (response.data.success) {
          const userData = response.data.user;
          setUserId(userData.id); // MySQL User_id
          setUserRole(userData.role);
          setProfileCompleted(userData.profileCompleted || false);
          setUserProfile(userData.profileData);
          
  
          const authToken = response.data.token || idToken; // Use backend token or Firebase token
          localStorage.setItem('authToken', authToken);
          localStorage.setItem('volunteerId', userData.volunteerId.toString());
          localStorage.setItem('userId', userData.id.toString());
          localStorage.setItem('user', JSON.stringify({
            id: userData.id,
            email: userData.email,
            role: userData.role,
            firebaseUid: userData.firebaseUid
          }));
          
          console.log('Saved to localStorage:', userData.id);
          console.log('Saved authToken:', authToken);
        }
      } catch (backendError) {
        console.error('Backend login error:', backendError);
        // Continue with Firebase data even if backend fails
      }

      return { user, role, profileCompleted };
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth);

      localStorage.removeItem('userId');
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      
      setUserRole(null);
      setUserProfile(null);
      setUserId(null);
      setProfileCompleted(false);
      
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

  // Update user profile in both Firestore and MySQL
  const updateUserProfile = async (uid, profileData) => {
    try {
      // Update Firestore
      await setDoc(doc(db, 'users', uid), {
        ...profileData,
        updatedAt: new Date().toISOString(),
        profileCompleted: true
      }, { merge: true });

      // Update backend (MySQL)
      const idToken = await auth.currentUser.getIdToken();
      await axios.put(`${API_BASE_URL}/users/profile`, {
        userId: userId, // MySQL User_id
        ...profileData
      }, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      setUserProfile(prev => ({ ...prev, ...profileData }));
      setProfileCompleted(true);
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
        
        // Try to get user data from backend
        try {
          const idToken = await user.getIdToken();
          const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            uid: user.uid,
            email: user.email,
            idToken: idToken
          });

          if (response.data.success) {
            const userData = response.data.user;
            setUserId(userData.id);
            setUserRole(userData.role);
            setProfileCompleted(userData.profileCompleted || false);
            setUserProfile(userData.profileData);
          }
        } catch (error) {
          console.error('Error fetching user data on auth state change:', error);
        }
      } else {
        setUserRole(null);
        setUserProfile(null);
        setUserId(null);
        setProfileCompleted(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [API_BASE_URL]);

  const value = {
    currentUser,
    userId, // MySQL User_id
    userRole,
    userProfile,
    profileCompleted,
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
