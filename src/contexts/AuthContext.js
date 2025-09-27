import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { signUp, logIn, logInWithGoogle, logOut } from '../auth';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

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
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user profile to get user type
        try {
          console.log('=== AUTHCONTEXT DEBUG ===');
          console.log('Fetching user profile for UID:', user.uid);
          
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          console.log('Document exists:', userSnap.exists());
          console.log('Document data:', userSnap.data());
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log('AuthContext - Fetched userData:', userData);
            console.log('AuthContext - userData.name:', userData.name);
            console.log('AuthContext - userData.username:', userData.username);
            console.log('AuthContext - userData.email:', userData.email);
            setUserProfile(userData);
          } else {
            console.log('AuthContext - No user profile found for uid:', user.uid);
            setUserProfile(null); // User exists but no profile yet
          }
          console.log('=== END AUTHCONTEXT DEBUG ===');
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password) => {
    return await signUp(email, password);
  };

  const login = async (email, password) => {
    return await logIn(email, password);
  };

  const googleLogin = async () => {
    return await logInWithGoogle();
  };

  const logout = async () => {
    return await logOut();
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    googleLogin,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
