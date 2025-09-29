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
          
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserProfile(userData);
          } else {
            setUserProfile(null); // User exists but no profile yet
          }
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
