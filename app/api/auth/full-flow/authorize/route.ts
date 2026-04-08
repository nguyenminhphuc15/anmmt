import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { code_challenge, email } = await req.json();

    if (!code_challenge || !email) {
      return NextResponse.json({ error: "missing_params" }, { status: 400 });
    }

    // Simulate Auth Server creating a code after user "Allows"
    const code = crypto.randomBytes(16).toString("hex");
    const expiresAt = Math.floor(Date.now() / 1000) + 60; // 60 seconds

    db.prepare(
      "INSERT INTO auth_codes (code, code_challenge, user_email, expires_at) VALUES (?, ?, ?, ?)",
    ).run(code, code_challenge, email, expiresAt);

    return NextResponse.json({
      code,
      state: "mock_state_123",
    });
  } catch (e) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
