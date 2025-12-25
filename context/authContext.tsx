"use client";

import { clearTokens, setTokens } from "@/action/auth.actions";
import { auth } from "@/firebase/client";
import {
  GoogleAuthProvider,
  ParsedToken,
  signInWithPopup,
  User,
} from "firebase/auth";
import { useRouter } from "next/navigation";
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
  customClaim: ParsedToken | null;
};
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [customClaim, setCustomClaim] = useState<ParsedToken | null>(null);
  const router = useRouter();

  const logout = async () => {
    await auth.signOut();
    router.refresh();
  };
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user ?? null);
      if (user) {
        const authToken = await user.getIdTokenResult();
        setCustomClaim(authToken.claims);

        const refreshToken = await user.refreshToken;
        if (authToken.token && refreshToken) {
          await setTokens(authToken.token, refreshToken);
        }
      } else {
        await clearTokens();
      }
    });
    return () => unsubscribe();
  }, []);
  return (
    <AuthContext
      value={{
        currentUser,
        logout,
        googleSignIn: handleGoogleSignIn,
        customClaim,
      }}
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
