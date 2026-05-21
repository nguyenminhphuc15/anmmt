import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { cookies } from "next/headers";
import db, { User } from "@/lib/db"; // Import interface User
import { signJWT } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();

    const expectedChallenge = cookieStore.get("passkey_challenge")?.value;
    const userId = cookieStore.get("passkey_user_id")?.value;

    if (!expectedChallenge || !userId) {
      return NextResponse.json({ error: "Thử thách đã hết hạn" }, { status: 400 });
    }

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: "http://localhost:3000",
      expectedRPID: "localhost",
      requireUserVerification: true,
    });

    if (verification.verified && verification.registrationInfo) {
      // Lấy đúng biến từ thư viện v10+
      const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

      const pubKeyBase64 = Buffer.from(credential.publicKey).toString("base64url");
      const credIdBase64 = credential.id; 
      const transports = credential.transports ? credential.transports.join(",") : null;

      db.prepare("DELETE FROM passkeys WHERE user_id = ?").run(userId);

      db.prepare(
        `INSERT INTO passkeys (id, user_id, public_key, counter, device_type, backed_up, transports)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        credIdBase64,
        userId,
        pubKeyBase64,
        credential.counter,
        credentialDeviceType,
        credentialBackedUp ? 1 : 0,
        transports
      );

      // Ép kiểu chuẩn xác thành User thay vì 'any'
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User;

      const jwt = await signJWT({
        sub: user.id,
        email: user.email,
        method: "Passkey",
      });

      const response = NextResponse.json({ success: true });

      response.cookies.delete("passkey_challenge");
      response.cookies.delete("passkey_user_id");

      response.cookies.set("auth_token", jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, 
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ error: "Xác minh thất bại" }, { status: 400 });
  } catch (error) {
    console.error("Verify Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}