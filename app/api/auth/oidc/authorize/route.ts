import { NextResponse } from "next/server";
import { signJWT } from "@/lib/jwt";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") || "";

  // OIDC requires 'openid' scope
  if (!scope.includes("openid")) {
    return NextResponse.json(
      { error: "missing_openid_scope" },
      { status: 400 },
    );
  }

  // Simulate OIDC success response (ID Token + Access Token)
  const idToken = await signJWT(
    {
      sub: "user_123",
      email: "demo@oidc.com",
      name: "OIDC Demo User",
      iat: Math.floor(Date.now() / 1000),
      iss: "https://auth-demo.local",
      aud: "client_id_456",
    },
    "1h",
  );

  return NextResponse.json({
    access_token: "mock_at_" + Math.random().toString(36).substring(7),
    id_token: idToken,
    token_type: "Bearer",
    expires_in: 3600,
    scope: scope,
  });
}
