import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider");

  if (!provider || (provider !== "google" && provider !== "github")) {
    return NextResponse.json(
      { error: "Provider không hợp lệ" },
      { status: 400 },
    );
  }

  // 1. Create State for CSRF protection
  const state = crypto.randomBytes(16).toString("hex");
  const expiresAt = Math.floor(Date.now() / 1000) + 600; // 10 mins

  db.prepare(
    `
    INSERT INTO oauth_states (state, provider, expires_at)
    VALUES (?, ?, ?)
  `,
  ).run(state, provider, expiresAt);

  // 2. Build Authorization URL
  let authUrl = "";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (provider === "google") {
    const clientId = process.env.GOOGLE_CLIENT_ID || "MOCK_GOOGLE_ID";
    const redirectUri = `${baseUrl}/api/auth/oauth/callback?provider=google`;
    authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&state=${state}`;
  } else {
    const clientId = process.env.GITHUB_CLIENT_ID || "MOCK_GITHUB_ID";
    const redirectUri = `${baseUrl}/api/auth/oauth/callback?provider=github`;
    authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,user:email&state=${state}`;
  }

  // In real implementation, we redirect. In demo, if no client id is set, we might just show the URL or mock it.
  // For the sake of this prompt, I'll assume we redirect.
  return NextResponse.redirect(new URL(authUrl));
}
