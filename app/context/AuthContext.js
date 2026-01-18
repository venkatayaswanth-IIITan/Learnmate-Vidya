'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);

  const fetchUserPoints = async (userId) => {
    try {
      const pointsRef = doc(db, "points", userId);
      const pointsDoc = await getDoc(pointsRef);

      if (pointsDoc.exists()) {
        setUserPoints(pointsDoc.data().stars || 0);
      } else {
        await setDoc(pointsRef, { stars: 0 });
        setUserPoints(0);
      }
    } catch (error) {
      console.error("Error fetching user points:", error);
    }
  };

  useEffect(() => {
    // Set a timeout to prevent infinite loading if Firebase doesn't initialize
    const loadingTimeout = setTimeout(() => {
      console.warn('Firebase initialization timeout - rendering app anyway');
      setLoading(false);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      clearTimeout(loadingTimeout);

      if (currentUser) {
        setUser(currentUser);
        fetchUserPoints(currentUser.uid);
      } else {
        setUser(null);
        setUserPoints(0);
      }
      setLoading(false);
    }, (error) => {
      // Error callback for onAuthStateChanged
      console.error("Firebase auth error:", error);
      clearTimeout(loadingTimeout);
      setLoading(false);
    });

    return () => {
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "points", userCredential.user.uid), {
        stars: 0
      });

      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    setUserPoints(0);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, userPoints, fetchUserPoints }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};