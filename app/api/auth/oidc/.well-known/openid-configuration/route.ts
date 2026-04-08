import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return NextResponse.json({
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/api/auth/oidc/authorize`,
    token_endpoint: `${baseUrl}/api/auth/oauth/token`, // reuse existing logic
    userinfo_endpoint: `${baseUrl}/api/auth/oidc/userinfo`,
    jwks_uri: `${baseUrl}/api/auth/oidc/jwks.json`,
    scopes_supported: ["openid", "profile", "email"],
    response_types_supported: ["code", "id_token", "token id_token"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["HS256"],
    claims_supported: [
      "sub",
      "iss",
      "auth_time",
      "name",
      "given_name",
      "family_name",
      "preferred_username",
      "email",
    ],
  });
}
