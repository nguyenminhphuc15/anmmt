import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import db from "@/lib/db";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Email không hợp lệ" },
        { status: 400 },
      );
    }

    const { email } = result.data;
    const now = Math.floor(Date.now() / 1000);

    // 1. Get or Create User
    let user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as any;
    if (!user) {
      const userId = crypto.randomUUID();
      db.prepare(
        `
        INSERT INTO users (id, email, provider, created_at)
        VALUES (?, ?, 'magic_link', ?)
      `,
      ).run(userId, email, now);
      user = { id: userId, email };
    }

    // 2. Generate Token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = now + 900; // 15 mins

    db.prepare(
      `
      INSERT INTO magic_tokens (token, user_id, email, expires_at)
      VALUES (?, ?, ?, ?)
    `,
    ).run(token, user.id, email, expiresAt);

    // 3. Send Email (Mock behavior if key is missing)
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/magic-link/callback?token=${token}`;

    if (resend) {
      await resend.emails.send({
        from: "Auth Demo <onboarding@resend.dev>",
        to: email,
        subject: "Link đăng nhập của bạn",
        html: `<p>Click vào đây để đăng nhập: <a href="${callbackUrl}">${callbackUrl}</a></p>`,
      });
    } else {
      console.log("------------------------------------------");
      console.log("MOCK EMAIL SENT TO:", email);
      console.log("CALLBACK URL:", callbackUrl);
      console.log("------------------------------------------");
    }

    return NextResponse.json({
      success: true,
      message: "Email đã được gửi",
      // Expose token in demo mode for debugging if needed, although usually we wouldn't
      debug: { token, callbackUrl },
    });
  } catch (error) {
    console.error("Magic Link Request Error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
