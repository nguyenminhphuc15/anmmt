import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const code = formData.get("code");
    const grantType = formData.get("grant_type");

    if (grantType !== "authorization_code") {
      return NextResponse.json(
        { error: "unsupported_grant_type" },
        { status: 400 },
      );
    }

    if (!code) {
      return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
    }

    // Simulate token generation
    const accessToken = crypto.randomBytes(32).toString("hex");
    const idToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidW5hbWUiOiJEZW1vIFVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9...";

    return NextResponse.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 3600,
      id_token: idToken,
      message: "Access token issued successfully (Simulated)",
    });
  } catch (error) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}
