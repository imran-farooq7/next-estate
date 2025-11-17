"use client";

import { auth } from "@/firebase/client";
import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
type AuthContextType = {
  currentUser: User | null;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<void>;
};
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const logout = async () => {
    await auth.signOut();
  };
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user ?? null);
    });
    return () => unsubscribe();
  }, []);
  return (
    <AuthContext
      value={{ currentUser, logout, googleSignIn: handleGoogleSignIn }}
    >
      {children}
    </AuthContext>
  );
};

export const useAuth = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error("use useAuth in provider");
  return authContext;
};
