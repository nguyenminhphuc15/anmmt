import { NextResponse } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "missing_token" }, { status: 400 });
    }

    // RFC 7009: Revoke the token
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const now = Math.floor(Date.now() / 1000);

    db.prepare(
      "INSERT OR IGNORE INTO revoked_tokens (token_hash, revoked_at) VALUES (?, ?)",
    ).run(tokenHash, now);

    return NextResponse.json({
      success: true,
      message: "Token revoked successfully",
    });
  } catch (e) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
