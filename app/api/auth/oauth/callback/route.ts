import { NextResponse } from "next/server";
import db from "@/lib/db";
import { signJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const provider = searchParams.get("provider");

  if (!code || !state || !provider) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_oauth_params", req.url),
    );
  }

  const now = Math.floor(Date.now() / 1000);

  // 1. Verify State (CSRF)
  const storedState = db
    .prepare(
      `
    SELECT * FROM oauth_states WHERE state = ? AND provider = ? AND expires_at > ?
  `,
    )
    .get(state, provider, now) as any;

  if (!storedState) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_state", req.url),
    );
  }

  // Delete state after use
  db.prepare("DELETE FROM oauth_states WHERE state = ?").run(state);

  try {
    let email = "";
    let name = "";
    let providerId = "";

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // 2. Exchange Code for Token & Get User Info
    if (provider === "google") {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID || "",
          client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
          redirect_uri: `${baseUrl}/api/auth/oauth/callback?provider=google`,
          grant_type: "authorization_code",
        }),
      });

      const tokens = await response.json();
      if (tokens.error)
        throw new Error(tokens.error_description || tokens.error);

      // Simple JWT decode or fetch profile
      const userRes = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        },
      );
      const userData = await userRes.json();
      email = userData.email;
      name = userData.name;
      providerId = userData.id;
    } else if (provider === "github") {
      const response = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            code,
            client_id: process.env.GITHUB_CLIENT_ID || "",
            client_secret: process.env.GITHUB_CLIENT_SECRET || "",
            redirect_uri: `${baseUrl}/api/auth/oauth/callback?provider=github`,
          }),
        },
      );

      const tokens = await response.json();
      if (tokens.error)
        throw new Error(tokens.error_description || tokens.error);

      const userRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const userData = await userRes.json();

      // GitHub email might need another call
      if (!userData.email) {
        const emailsRes = await fetch("https://api.github.com/user/emails", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const emails = await emailsRes.json();
        email = emails.find((e: any) => e.primary)?.email || emails[0]?.email;
      } else {
        email = userData.email;
      }

      name = userData.name || userData.login;
      providerId = userData.id.toString();
    }

    // 3. Upsert User in DB
    let user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as any;
    if (!user) {
      const userId = crypto.randomUUID();
      db.prepare(
        `
        INSERT INTO users (id, email, name, provider, provider_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      ).run(userId, email, name, provider, providerId, now);
      user = { id: userId, email };
    }

    // 4. Create Session
    const jwt = await signJWT({
      sub: user.id,
      email,
      method: provider === "google" ? "Google" : "GitHub",
    });

    const cookieStore = await cookies();
    cookieStore.set("auth_token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (error: any) {
    console.error("OAuth Callback Error:", error);
    return NextResponse.redirect(
      new URL(
        `/login?error=auth_failed&msg=${encodeURIComponent(error.message)}`,
        req.url,
      ),
    );
  }
}
