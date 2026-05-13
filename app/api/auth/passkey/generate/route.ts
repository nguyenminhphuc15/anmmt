import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import db, { User } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json(); // Lấy email từ Form UI
    if (!email) return NextResponse.json({ error: "Thiếu email" }, { status: 400 });

    const rpName = "AuthFlow Demo";
    const rpID = "localhost";

    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined;
    
    if (!user) {
      const userId = crypto.randomUUID();
      const now = Math.floor(Date.now() / 1000);
      db.prepare(
        "INSERT INTO users (id, email, name, provider, created_at) VALUES (?, ?, ?, ?, ?)"
      ).run(userId, email, "Passkey User", "passkey", now);
      
      user = { id: userId, email, name: "Passkey User", provider: "passkey", provider_id: null, created_at: now };
    }

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new TextEncoder().encode(user.id),
      userName: user.email,
      userDisplayName: user.name || user.email,
      attestationType: "none",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "required",
      },
    });

    const response = NextResponse.json(options);

    response.cookies.set("passkey_challenge", options.challenge, { httpOnly: true, maxAge: 300 });
    response.cookies.set("passkey_user_id", user.id, { httpOnly: true, maxAge: 300 });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tạo thử thách" }, { status: 500 });
  }
}