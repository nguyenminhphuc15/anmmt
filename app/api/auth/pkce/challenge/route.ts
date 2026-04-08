import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";

export async function GET() {
  // 1. Generate code_verifier
  const verifier = crypto.randomBytes(32).toString("base64url");

  // 2. Generate code_challenge (SHA256 hash of verifier, then base64url encoded)
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");

  // 3. Store in DB (TTL 10 mins)
  const now = Math.floor(Date.now() / 1000);
  db.prepare(
    `
    INSERT INTO pkce_challenges (code_verifier, code_challenge, created_at)
    VALUES (?, ?, ?)
  `,
  ).run(verifier, challenge, now);

  return NextResponse.json({
    code_verifier: verifier,
    code_challenge: challenge,
    method: "S256",
  });
}
