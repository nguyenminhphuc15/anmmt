import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const responseType = searchParams.get("response_type");
  const clientId = searchParams.get("client_id");

  if (responseType !== "code") {
    return NextResponse.json(
      { error: "unsupported_response_type" },
      { status: 400 },
    );
  }

  // Simulate generating a one-time authorization code
  const code = crypto.randomBytes(8).toString("hex");

  return NextResponse.json({
    code,
    state: searchParams.get("state"),
    message: "Authorization code issued successfully (Simulated)",
  });
}
