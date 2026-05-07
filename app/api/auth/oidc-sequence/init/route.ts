import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";
import { logToFile } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const { provider } = await req.json();
    logToFile(`[OIDC Init] Starting flow for provider: ${provider}`, "INFO");

    if (!provider || (provider !== "google" && provider !== "github")) {
      return NextResponse.json(
        { error: "Provider không hợp lệ" },
        { status: 400 },
      );
    }

    // 1. Tạo 'state' & 'nonce'
    const state = crypto.randomBytes(16).toString("hex");
    const nonce = crypto.randomBytes(16).toString("hex");
    logToFile(`[OIDC Init] Generated state: ${state}, nonce: ${nonce}`, "INFO");

    // 2. Tạo 'code_verifier' (chuỗi ngẫu nhiên bí mật)
    const code_verifier = crypto.randomBytes(32).toString("base64url");

    // 3. Hash SHA-256 'code_verifier' -> 'code_challenge'
    const code_challenge = crypto
      .createHash("sha256")
      .update(code_verifier)
      .digest("base64url");
    logToFile(
      `[OIDC Init] Created PKCE Proof: challenge=${code_challenge.substring(0, 10)}...`,
      "INFO",
    );

    // 4. Lưu 'state', 'nonce' & 'code_verifier' vào SQLite
    const expiresAt = Math.floor(Date.now() / 1000) + 600; // 10 mins
    logToFile(
      `[DB] INSERT INTO oidc_flows (state, nonce, code_verifier, ...)`,
      "DB",
    );
    db.prepare(
      `
      INSERT INTO oidc_flows (state, nonce, code_verifier, provider, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `,
    ).run(state, nonce, code_verifier, provider, expiresAt);

    // 5. Tạo Authorization URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    let authUrl = "";

    if (provider === "google") {
      const clientId = process.env.GOOGLE_CLIENT_ID || "GOOGLE_CLIENT_ID_MOCK";
      const redirectUri = `${baseUrl}/api/auth/oidc-sequence/callback`;
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&state=${state}&nonce=${nonce}&code_challenge=${code_challenge}&code_challenge_method=S256`;
    } else {
      const clientId = process.env.GITHUB_CLIENT_ID || "GITHUB_CLIENT_ID_MOCK";
      const redirectUri = `${baseUrl}/api/auth/oidc-sequence/callback`;
      // GitHub doesn't natively support PKCE in standard OAuth2 but some providers do.
      // For demo purposes, we include it.
      authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,user:email&state=${state}&nonce=${nonce}&code_challenge=${code_challenge}&code_challenge_method=S256`;
    }

    return NextResponse.json({
      state,
      nonce,
      code_verifier,
      code_challenge,
      authUrl,
    });
  } catch (error) {
    console.error("OIDC Init Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
