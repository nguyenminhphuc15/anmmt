import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { code_verifier } = await req.json();

    if (!code_verifier) {
      return NextResponse.json(
        { error: "Missing code_verifier" },
        { status: 400 },
      );
    }

    // 1. Lookup challenge
    const record = db
      .prepare("SELECT * FROM pkce_challenges WHERE code_verifier = ?")
      .get(code_verifier) as any;

    if (!record) {
      return NextResponse.json({ valid: false, message: "Verifier not found" });
    }

    // 2. Perform SHA-256 transformation
    const computedChallenge = crypto
      .createHash("sha256")
      .update(code_verifier)
      .digest("base64url");

    // 3. Compare
    const isValid = computedChallenge === record.code_challenge;

    // Optional: delete record after verification
    // db.prepare("DELETE FROM pkce_challenges WHERE code_verifier = ?").run(code_verifier);

    return NextResponse.json({
      valid: isValid,
      stored_challenge: record.code_challenge,
      computed_challenge: computedChallenge,
      transformation: "BASE64URL(SHA256(verifier))",
    });
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
