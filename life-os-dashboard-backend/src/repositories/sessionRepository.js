import { randomBytes } from "node:crypto";
import { db } from "../db/connection.js";
import { nowIso } from "../utils/time.js";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7일

export function createSession(userId) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  db.prepare(`
    INSERT INTO sessions (token, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(token, userId, expiresAt, nowIso());
  return token;
}

export function getSession(token) {
  return db.prepare("SELECT * FROM sessions WHERE token = ?").get(token) ?? null;
}

export function deleteSession(token) {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function deleteExpiredSessions() {
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(nowIso());
}
