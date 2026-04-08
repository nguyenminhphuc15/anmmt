import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import db from "@/lib/db";
import crypto from "crypto";

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Check if Revoked
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const isRevoked = db
    .prepare("SELECT 1 FROM revoked_tokens WHERE token_hash = ?")
    .get(tokenHash);

  if (isRevoked) {
    return NextResponse.json(
      { error: "RevokedToken", message: "This token has been revoked." },
      { status: 401 },
    );
  }

  // 2. Verify JWT
  const payload = await verifyJWT(token);
  if (!payload) {
    return NextResponse.json({ error: "InvalidToken" }, { status: 401 });
  }

  return NextResponse.json({
    message: "Access Granted",
    data: "This is a highly sensitive resource protected by OAuth2/OIDC.",
  });
}
