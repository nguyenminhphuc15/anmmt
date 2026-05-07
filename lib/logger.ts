import fs from "fs";
import path from "path";
import db from "./db";

const LOG_FILE = path.join(process.cwd(), "server_logs.txt");

export function logToFile(
  message: string,
  type: "INFO" | "ERROR" | "DB" = "INFO",
) {
  const timestamp = Date.now();
  const dateStr = new Date(timestamp).toISOString();
  const logEntry = `[${dateStr}] [${type}] ${message}\n`;

  try {
    // 1. File log
    fs.appendFileSync(LOG_FILE, logEntry);

    // 2. DB log
    db.prepare(
      "INSERT INTO logs (timestamp, type, message) VALUES (?, ?, ?)",
    ).run(timestamp, type, message);

    console.log(logEntry.trim());
  } catch (err) {
    console.error("Failed to write log:", err);
  }
}
