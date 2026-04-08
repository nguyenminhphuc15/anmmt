import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import db from "@/lib/db";
import { Resend } from "resend";
import { logToFile } from "@/lib/logger";

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
      logToFile(`Invalid email request: ${JSON.stringify(body)}`, "ERROR");
      return NextResponse.json(
        { error: "Email không hợp lệ" },
        { status: 400 },
      );
    }

    const { email } = result.data;
    const now = Math.floor(Date.now() / 1000);

    logToFile(`Incoming magic link request for: ${email}`);

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
      logToFile(`New user created in DB: ${email}`, "DB");
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
    logToFile(`Magic token generated and saved for: ${email}`, "DB");

    // 3. Send Email (Mock behavior if key is missing)
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/magic-link/callback?token=${token}`;

    if (resend) {
      await resend.emails.send({
        from: "Auth Demo <onboarding@resend.dev>",
        to: email,
        subject: "Link đăng nhập của bạn",
        html: `<p>Click vào đây để đăng nhập: <a href="${callbackUrl}">${callbackUrl}</a></p>`,
      });
      logToFile(`Real email sent via Resend to: ${email}`);
    } else {
      logToFile(`MOCK EMAIL LOG: To: ${email} | URL: ${callbackUrl}`);
    }

    return NextResponse.json({
      success: true,
      message: "Email đã được gửi",
      debug: { token, callbackUrl },
    });
  } catch (error: any) {
    logToFile(`Magic Link Request Error: ${error.message}`, "ERROR");
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
