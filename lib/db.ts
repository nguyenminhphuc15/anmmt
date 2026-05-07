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

  CREATE TABLE IF NOT EXISTS oidc_flows (
    state           TEXT PRIMARY KEY,
    nonce           TEXT NOT NULL,
    code_verifier   TEXT NOT NULL,
    provider        TEXT NOT NULL,
    expires_at      INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp   INTEGER NOT NULL,
    type        TEXT NOT NULL,
    message     TEXT NOT NULL
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
