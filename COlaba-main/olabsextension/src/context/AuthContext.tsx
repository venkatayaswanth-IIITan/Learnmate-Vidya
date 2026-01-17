'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  User
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { storeData, getData } from "../utils/storage";

const AuthContext = createContext<any>({});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check stored user session
    getData("user").then((storedUser) => {
      if (storedUser) {
        setUser(storedUser);
      }
      setLoading(false);
    });

    // Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        storeData("user", firebaseUser);
      } else {
        setUser(null);
        storeData("user", null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    setUser(userCredential.user);
    storeData("user", userCredential.user);
  };

  const signup = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    setUser(userCredential.user);
    storeData("user", userCredential.user);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    storeData("user", null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};