"use client";

import { auth } from "@/firebase/client";
import { User } from "firebase/auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
type AuthContextType = {
  currentUser: User | null;
};
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user ?? null);
    });
    return () => unsubscribe();
  }, []);
  return <AuthContext value={{ currentUser }}>{children}</AuthContext>;
};
export const useAuth = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error("use useAuth in provider");
  return authContext;
};
