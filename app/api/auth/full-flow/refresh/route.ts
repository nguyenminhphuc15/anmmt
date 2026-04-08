import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";
import { signJWT } from "@/lib/jwt";
import { logToFile } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const { refresh_token } = await req.json();

    if (!refresh_token) {
      logToFile("Refresh failed: Missing token", "ERROR");
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const rtHash = crypto
      .createHash("sha256")
      .update(refresh_token)
      .digest("hex");

    // 1. Find token
    const record = db
      .prepare("SELECT * FROM refresh_tokens WHERE token_hash = ?")
      .get(rtHash) as any;

    if (!record) {
      logToFile(
        `Grant failed: Refresh token ${refresh_token?.substring(0, 8)}... not found`,
        "ERROR",
      );
      return NextResponse.json(
        { error: "invalid_grant", message: "Token not found" },
        { status: 400 },
      );
    }

    // 2. Detection: Reuse check
    if (record.used === 1) {
      logToFile(
        `SECURITY ALERT: Refresh Token REUSE detected for user ${record.user_id}!`,
        "ERROR",
      );
      return NextResponse.json(
        {
          error: "invalid_grant",
          message: "Breach detected! Refresh token reused.",
        },
        { status: 400 },
      );
    }

    // 3. Expiry check
    if (record.expires_at < Math.floor(Date.now() / 1000)) {
      logToFile(
        `Grant failed: Token expired for user ${record.user_id}`,
        "ERROR",
      );
      return NextResponse.json(
        { error: "invalid_grant", message: "Token expired" },
        { status: 400 },
      );
    }

    // 4. Mark old one as used
    db.prepare("UPDATE refresh_tokens SET used = 1 WHERE token_hash = ?").run(
      rtHash,
    );

    // 5. Issue new pair (Rotation)
    const newRefreshToken = crypto.randomBytes(32).toString("hex");
    const newRtHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");
    const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

    db.prepare(
      "INSERT INTO refresh_tokens (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
    ).run(newRtHash, record.user_id, expiresAt);

    const newAccessToken = await signJWT(
      { sub: record.user_id, scope: "openid", method: "refresh" },
      "15m",
    );

    logToFile(
      `Token rotation successful for user: ${record.user_id}. New RT issued.`,
      "DB",
    );

    return NextResponse.json({
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_in: 900,
    });
  } catch (err: any) {
    logToFile(`Refresh Error: ${err.message}`, "ERROR");
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
