import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { cookies } from "next/headers";
import db, { User, Passkey } from "@/lib/db";
import { signJWT } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    const expectedChallenge = cookieStore.get("passkey_auth_challenge")?.value;

    if (!expectedChallenge) {
      return NextResponse.json({ error: "Thử thách hết hạn" }, { status: 400 });
    }

    // 1. Tìm khóa trong SQLite dựa vào ID mà trình duyệt gửi lên
    const passkey = db.prepare("SELECT * FROM passkeys WHERE id = ?").get(body.id) as Passkey | undefined;
    
    if (!passkey) {
      return NextResponse.json({ error: "Không tìm thấy khóa truy cập trên hệ thống" }, { status: 404 });
    }

    // 2. Tìm thông tin User sở hữu khóa này
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(passkey.user_id) as User;

    // 3. Tiến hành giải mã và xác minh chữ ký sinh trắc học
    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: "http://localhost:3000",
      expectedRPID: "localhost",
      credential: {
        id: passkey.id,
        publicKey: new Uint8Array(Buffer.from(passkey.public_key, 'base64url')),
        counter: passkey.counter,
        // Dùng as any để sửa luôn cái lỗi gạch đỏ TypeScript (nếu có)
        transports: passkey.transports ? (passkey.transports.split(",") as ("usb" | "ble" | "nfc" | "internal")[]) : undefined,
      },
      requireUserVerification: true, // <--- CỜ QUAN TRỌNG NHẤT PHẢI NẰM CHÍNH XÁC Ở ĐÂY
    });

    if (verification.verified) {
      // 4. Cập nhật biến đếm (counter) để chống tấn công phát lại (Replay Attack)
      db.prepare("UPDATE passkeys SET counter = ? WHERE id = ?").run(
        verification.authenticationInfo.newCounter,
        passkey.id
      );

      // 5. Đăng nhập thành công -> Cấp JWT
      const jwt = await signJWT({
        sub: user.id,
        email: user.email,
        method: "Passkey",
      });

      const response = NextResponse.json({ success: true, email: user.email });
      
      response.cookies.delete("passkey_auth_challenge");
      response.cookies.set("auth_token", jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ error: "Xác thực Passkey thất bại" }, { status: 400 });
  } catch (error) {
    console.error("Login Verify Error:", error);
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}