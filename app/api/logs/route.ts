import { NextResponse } from "next/server";
import db from "@/lib/db";
import { logToFile } from "@/lib/logger";

export async function GET() {
  try {
    const logs = db
      .prepare("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 50")
      .all();
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { message, type } = await req.json();
    logToFile(message, type || "INFO");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add log" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    db.prepare("DELETE FROM logs").run();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to clear logs" },
      { status: 500 },
    );
  }
}
