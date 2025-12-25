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
  const decodedToken = await auth.verifyIdToken(authToken.value);
  if (!decodedToken.admin) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/admin-dashboard", "/admin-dashboard/:path*"],
};
