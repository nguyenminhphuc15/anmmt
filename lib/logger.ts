import fs from "fs";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "server_logs.txt");

export function logToFile(
  message: string,
  type: "INFO" | "ERROR" | "DB" = "INFO",
) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${type}] ${message}\n`;

  try {
    fs.appendFileSync(LOG_FILE, logEntry);
    console.log(logEntry.trim()); // Still log to console for dev
  } catch (err) {
    console.error("Failed to write to log file:", err);
  }
}
