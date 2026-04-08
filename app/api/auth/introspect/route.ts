import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import db from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ active: false });
    }

    // 1. Check revocation list first
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const isRevoked = db
      .prepare("SELECT 1 FROM revoked_tokens WHERE token_hash = ?")
      .get(tokenHash);

    if (isRevoked) {
      return NextResponse.json({ active: false, reason: "Token was revoked" });
    }

    // 2. Verify JWT structure and expiration
    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json({ active: false });
    }

    // 3. Respond with introspection data (RFC 7662)
    return NextResponse.json({
      active: true,
      scope: (payload.scope as string) || "openid profile email",
      client_id: (payload.aud as string) || "demo_client",
      username: (payload.email as string) || "demo_user",
      sub: payload.sub,
      exp: payload.exp,
      iat: payload.iat,
      iss: payload.iss,
    });
  } catch (e) {
    return NextResponse.json({ active: false, error: "Server error" });
  }
}
