import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const options = await generateAuthenticationOptions({
      rpID: "localhost",
      userVerification: "required", // không bắt buộc dùng vân tay/PIN 
    });

    const response = NextResponse.json(options);

    // Lưu challenge vào Cookie để kiểm chứng ở bước sau
    const cookieStore = await cookies();
    cookieStore.set("passkey_auth_challenge", options.challenge, {
      httpOnly: true,
      maxAge: 300, // 5 phút
    });

    return response;
  } catch (error) {
    console.error("Login Generate Error:", error);
    return NextResponse.json({ error: "Lỗi khởi tạo đăng nhập" }, { status: 500 });
  }
}