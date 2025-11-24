"use server";

import { auth } from "@/firebase/server";
import { cookies } from "next/headers";

export const setTokens = async (accessToken: string, refreshToken: string) => {
  try {
    const verifyToken = await auth.verifyIdToken(accessToken);
    if (!verifyToken) {
      return;
    }
    const user = await auth.getUser(verifyToken.uid);
    if (process.env.ADMIN_EMAIL === user.email && !user.customClaims?.admin) {
      await auth.setCustomUserClaims(verifyToken.uid, { admin: true });
      const cookiesStore = await cookies();
      cookiesStore.set("firebaseAuthToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      cookiesStore.set("firebaseRefreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    } else {
      const cookiesStore = await cookies();
      cookiesStore.set("firebaseAuthToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      cookiesStore.set("firebaseRefreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    }
  } catch (error) {
    console.log(error);
  }
};
export const clearTokens = async () => {
  const cookiesStore = await cookies();
  cookiesStore.delete("firebaseAuthToken");
  cookiesStore.delete("firebaseRefreshToken");
};
