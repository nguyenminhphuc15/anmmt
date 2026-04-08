import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";
import { signJWT } from "@/lib/jwt";
import { logToFile } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const { code, code_verifier, client_id } = await req.json();

    logToFile(
      `Token exchange request received for code: ${code?.substring(0, 8)}...`,
    );

    if (!code || !code_verifier) {
      logToFile("Token exchange failed: Missing parameters", "ERROR");
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    // 1. Lookup auth code
    const authCode = db
      .prepare("SELECT * FROM auth_codes WHERE code = ? AND used = 0")
      .get(code) as any;
    if (!authCode) {
      logToFile(
        `Grant failed: Code ${code?.substring(0, 8)} not found or used`,
        "ERROR",
      );
      return NextResponse.json(
        { error: "invalid_grant", message: "Code expired or used" },
        { status: 400 },
      );
    }

    // 2. PKCE Verify: SHA256(verifier) == challenge
    const computedChallenge = crypto
      .createHash("sha256")
      .update(code_verifier)
      .digest("base64url");

    if (computedChallenge !== authCode.code_challenge) {
      logToFile(
        `PKCE Mismatch! verifier: ${code_verifier.substring(0, 10)}... | Expected: ${authCode.code_challenge}`,
        "ERROR",
      );
      return NextResponse.json(
        { error: "invalid_grant", message: "PKCE verification failed" },
        { status: 400 },
      );
    }

    logToFile("PKCE verification success", "INFO");

    // 3. Mark code as used
    db.prepare("UPDATE auth_codes SET used = 1 WHERE code = ?").run(code);

    // 4. Issue Tokens
    const userId = "user_" + Math.random().toString(36).substring(7);
    const email = authCode.user_email;

    // Access Token (15m)
    const accessToken = await signJWT(
      { sub: userId, email, scope: "openid profile email", method: "pkce" },
      "15m",
    );

    // ID Token (1h)
    const idToken = await signJWT(
      {
        sub: userId,
        email,
        name: "Full Flow Demo User",
        iss: "auth-demo.local",
        aud: client_id,
      },
      "1h",
    );

    // Refresh Token (Opaque)
    const refreshToken = crypto.randomBytes(32).toString("hex");
    const rtHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days

    db.prepare(
      "INSERT INTO refresh_tokens (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
    ).run(rtHash, userId, expiresAt);

    logToFile(
      `Tokens issued for user: ${email}. Access & Refresh tokens generated.`,
      "DB",
    );

    return NextResponse.json({
      access_token: accessToken,
      id_token: idToken,
      refresh_token: refreshToken,
      expires_in: 900,
      token_type: "Bearer",
    });
  } catch (err: any) {
    logToFile(`Token Exchange Error: ${err.message}`, "ERROR");
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
