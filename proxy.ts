import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "./firebase/server";

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  if (request.method === "POST") {
    return NextResponse.next();
  }
  const cookiesStore = await cookies();
  const authToken = cookiesStore.get("firebaseAuthToken");

  if (!authToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const decodedToken = await auth.verifyIdToken(authToken.value);
    if (!decodedToken.admin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  } catch (err: any) {
    // If the ID token is expired, attempt to refresh it using the refresh token
    const isExpired =
      err?.code === "auth/id-token-expired" ||
      String(err?.message || "")
        .toLowerCase()
        .includes("id-token-expired");
    if (!isExpired) {
      console.log("verifyIdToken failed:", err);
      return NextResponse.redirect(new URL("/", request.url));
    }

    const refreshCookie = cookiesStore.get("firebaseRefreshToken");
    if (!refreshCookie?.value) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    try {
      const API_KEY =
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
        "AIzaSyBnEBwSpBKjrdYpOAZYvkVb1rDRvtcj6kk";
      const tokenRes = await fetch(
        `https://securetoken.googleapis.com/v1/token?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshCookie.value,
          }).toString(),
        }
      );

      if (!tokenRes.ok) {
        console.log("refresh token exchange failed", await tokenRes.text());
        return NextResponse.redirect(new URL("/", request.url));
      }

      const data = await tokenRes.json();
      const newIdToken = data.id_token as string | undefined;
      const newRefreshToken = data.refresh_token as string | undefined;
      if (!newIdToken) {
        console.log("no id_token returned from refresh exchange", data);
        return NextResponse.redirect(new URL("/", request.url));
      }

      // update cookies with new tokens
      cookiesStore.set("firebaseAuthToken", newIdToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      if (newRefreshToken) {
        cookiesStore.set("firebaseRefreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });
      }

      // verify the refreshed id token
      const decodedToken = await auth.verifyIdToken(newIdToken);
      if (!decodedToken.admin) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next();
    } catch (refreshErr) {
      console.log("error refreshing id token:", refreshErr);
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/admin-dashboard", "/admin-dashboard/:path*"],
};
