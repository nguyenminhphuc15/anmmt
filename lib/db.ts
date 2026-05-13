import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "auth_demo.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id        TEXT PRIMARY KEY,
    email     TEXT UNIQUE NOT NULL,
    name      TEXT,
    provider  TEXT NOT NULL,
    provider_id TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS magic_tokens (
    token     TEXT PRIMARY KEY,
    user_id   TEXT NOT NULL,
    email     TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    used      INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS oauth_states (
    state     TEXT PRIMARY KEY,
    provider  TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS revoked_tokens (
    token_hash  TEXT PRIMARY KEY,
    revoked_at  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pkce_challenges (
    code_verifier    TEXT PRIMARY KEY,
    code_challenge   TEXT NOT NULL,
    created_at       INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS auth_codes (
    code            TEXT PRIMARY KEY,
    code_challenge  TEXT NOT NULL,
    user_email      TEXT NOT NULL,
    expires_at      INTEGER NOT NULL,
    used            INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    token_hash  TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL,
    expires_at  INTEGER NOT NULL,
    used        INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS passkeys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    public_key TEXT NOT NULL,
    counter INTEGER NOT NULL,
    device_type TEXT NOT NULL,
    backed_up INTEGER NOT NULL,
    transports TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

export default db;

export interface User {
  id: string;
  email: string;
  name: string | null;
  provider: string;
  provider_id: string | null;
  created_at: number;
}

export interface MagicToken {
  token: string;
  user_id: string;
  email: string;
  expires_at: number;
  used: number;
}

export interface OAuthState {
  state: string;
  provider: string;
  expires_at: number;
}

export interface Passkey {
  id: string;              // Credential ID (định danh của khóa)
  user_id: string;         // Khóa ngoại liên kết tới bảng users
  public_key: string;      // Khóa công khai (Public Key) lưu dưới dạng base64
  counter: number;         // Biến đếm số lần sử dụng để chống tấn công phát lại
  device_type: string;     // Loại thiết bị (ví dụ: 'single_device' hoặc 'multi_device')
  backed_up: number;       // Trạng thái đã sao lưu khóa (0 hoặc 1)
  transports: string | null; // Các giao thức hỗ trợ (usb, ble, nfc, internal)
}