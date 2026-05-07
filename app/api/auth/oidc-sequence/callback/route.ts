import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";
import { signJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import { logToFile } from "@/lib/logger";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  logToFile(`[OIDC Callback] Received callback with state: ${state}`, "INFO");

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing code or state" },
      { status: 400 },
    );
  }

  // 1. Truy vấn lấy 'state' & 'code_verifier'
  logToFile(`[DB] SELECT * FROM oidc_flows WHERE state = ...`, "DB");
  const flow = db
    .prepare("SELECT * FROM oidc_flows WHERE state = ?")
    .get(state) as any;

  if (!flow) {
    logToFile(`[OIDC Callback] Error: State not found in DB`, "ERROR");
    // S-->>U: Lỗi nếu dữ liệu SQLite không tồn tại
    return NextResponse.json(
      { error: "Invalid state or flow expired" },
      { status: 400 },
    );
  }

  // Đối với Demo này, ta sẽ trả về thông tin để Frontend hiển thị chi tiết các bước tiếp theo
  // Nếu redirect thẳng thì User sẽ không kịp thấy các bước Verify.
  // Tuy nhiên, theo luồng sequenceDiagram: U -> S -> OP

  // Ta sẽ thực hiện exchange ngay tại đây và redirect về trang demo với kết quả.
  try {
    const provider = flow.provider;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Giai đoạn 3: Trao đổi mã với Verifier
    // Note right of S: Gửi kèm bí mật PKCE
    // S->>OP: POST /token (Code + Client_Secret + code_verifier)

    let tokenEndpoint = "";
    let clientId = "";
    let clientSecret = "";

    if (provider === "google") {
      tokenEndpoint = "https://oauth2.googleapis.com/token";
      clientId = process.env.GOOGLE_CLIENT_ID || "GOOGLE_CLIENT_ID_MOCK";
      clientSecret =
        process.env.GOOGLE_CLIENT_SECRET || "GOOGLE_CLIENT_SECRET_MOCK";
    } else {
      tokenEndpoint = "https://github.com/login/oauth/access_token";
      clientId = process.env.GITHUB_CLIENT_ID || "GITHUB_CLIENT_ID_MOCK";
      clientSecret =
        process.env.GITHUB_CLIENT_SECRET || "GITHUB_CLIENT_SECRET_MOCK";
    }

    logToFile(
      `[OIDC Callback] Exchanging code for tokens at ${tokenEndpoint}`,
      "INFO",
    );
    logToFile(
      `[OIDC Callback] Sending code_verifier: ${flow.code_verifier.substring(0, 5)}...`,
      "INFO",
    );

    const exchangeResponse = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        code_verifier: flow.code_verifier,
        grant_type: "authorization_code",
        redirect_uri: `${baseUrl}/api/auth/oidc-sequence/callback`,
      }),
    });

    const tokens = await exchangeResponse.json();

    if (!tokens.access_token) {
      logToFile(
        `[OIDC Callback] Token exchange FAILED: ${JSON.stringify(tokens)}`,
        "ERROR",
      );
      return NextResponse.json(
        { error: "Failed to exchange token", details: tokens },
        { status: 400 },
      );
    }

    logToFile(
      `[OIDC Callback] Token exchange SUCCESS. Received Access Token & ID Token`,
      "INFO",
    );

    // Giai đoạn 4: Verify & Sync
    // Verify ID Token Signature & Nonce (Thực tế nên dùng jose để verify)
    logToFile(`[OIDC Callback] Verifying Nonce...`, "INFO");
    // Ở đây ta mô phỏng việc verify nonce

    // Sync dữ liệu User (INSERT/UPDATE)
    // Giả lập lấy user info từ ID Token hoặc UserInfo Endpoint
    const email =
      provider === "google" ? "google_user@demo.com" : "github_user@demo.com";
    const userId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    logToFile(`[DB] INSERT INTO users (email: ${email})`, "DB");
    db.prepare(
      `
      INSERT INTO users (id, email, name, provider, created_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET name = excluded.name
    `,
    ).run(userId, email, `Demo ${provider} User`, provider, now);

    // Khởi tạo Session (HttpOnly Cookie)
    logToFile(
      `[OIDC Callback] Creating session and setting HttpOnly cookie`,
      "INFO",
    );
    const sessionToken = await signJWT({ sub: userId, email });
    const cookieStore = await cookies();
    cookieStore.set("auth_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600,
      path: "/",
    });

    // Xóa flow sau khi dùng
    logToFile(`[DB] DELETE FROM oidc_flows WHERE state = ...`, "DB");
    db.prepare("DELETE FROM oidc_flows WHERE state = ?").run(state);

    logToFile(
      `[OIDC Callback] Success! Redirecting user to demo page.`,
      "INFO",
    );

    // Redirect tới trang demo kết quả thành công thay vì dashboard để user thấy kết quả demo
    return NextResponse.redirect(
      `${baseUrl}/demo/oidc-sequence?success=true&email=${email}&provider=${provider}`,
    );
  } catch (error) {
    console.error("Exchange Error:", error);
    return NextResponse.json(
      { error: "Token exchange failed" },
      { status: 500 },
    );
  }
}
