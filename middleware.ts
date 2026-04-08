import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  // Protect /dashboard
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      const response = NextResponse.redirect(
        new URL("/login?error=session_expired", request.url),
      );
      response.cookies.delete("auth_token");
      return response;
    }
  }

  // Redirect if already logged in and going to /login
  if (request.nextUrl.pathname.startsWith("/login")) {
    if (token) {
      const payload = await verifyJWT(token);
      if (payload) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/login"],
};
