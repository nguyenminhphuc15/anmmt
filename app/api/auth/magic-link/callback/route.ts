import { NextResponse } from "next/server";
import db from "@/lib/db";
import { signJWT } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/login?error=missing_token", req.url),
    );
  }

  const now = Math.floor(Date.now() / 1000);

  // 1. Verify Token
  const storedToken = db
    .prepare(
      `
    SELECT * FROM magic_tokens 
    WHERE token = ? AND used = 0 AND expires_at > ?
  `,
    )
    .get(token, now) as any;

  if (!storedToken) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_token", req.url),
    );
  }

  // 2. Invalidate Token
  db.prepare("UPDATE magic_tokens SET used = 1 WHERE token = ?").run(token);

  // 3. Create Session (JWT)
  const jwt = await signJWT({
    sub: storedToken.user_id,
    email: storedToken.email,
    method: "Magic Link",
  });

  // 4. Set Cookie
  const cookieStore = await cookies();
  cookieStore.set("auth_token", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  });

  // 5. Redirect to Dashboard
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
