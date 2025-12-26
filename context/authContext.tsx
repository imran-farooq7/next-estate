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
    let intervalId: number | undefined;
    const handle = auth.onIdTokenChanged(async (user) => {
      setCurrentUser(user ?? null);
      if (user) {
        try {
          const authTokenResult = await user.getIdTokenResult();
          setCustomClaim(authTokenResult.claims);
          const token = authTokenResult.token;
          // `refreshToken` is available on the user object in the client SDK
          const refreshToken = (user as any).refreshToken;
          if (token && refreshToken) {
            await setTokens(token, refreshToken);
          }
        } catch (err) {
          console.log("error getting id token result:", err);
        }
      } else {
        await clearTokens();
      }
    });

    // Periodically force-refresh the ID token to avoid expiry (every 30 minutes)
    intervalId = window.setInterval(async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const freshToken = await user.getIdToken(true);
          const refreshToken = (user as any).refreshToken;
          if (freshToken && refreshToken) {
            await setTokens(freshToken, refreshToken);
          }
        } catch (err) {
          console.log("error refreshing id token:", err);
        }
      }
    }, 30 * 60 * 1000);

    return () => {
      handle();
      if (intervalId) clearInterval(intervalId);
    };
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
