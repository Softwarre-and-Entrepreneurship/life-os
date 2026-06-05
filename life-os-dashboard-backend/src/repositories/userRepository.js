import { db } from "../db/connection.js";
import { createId } from "../utils/ids.js";
import { nowIso } from "../utils/time.js";

export function createUser({ username, passwordHash, salt, displayName, avatar, profileId }) {
  const id = createId("usr");
  const now = nowIso();
  db.prepare(`
    INSERT INTO users (id, username, password_hash, salt, display_name, avatar, profile_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, username, passwordHash, salt, displayName, avatar, profileId, now);
  return getUserById(id);
}

export function getUserByUsername(username) {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username) ?? null;
}

export function getUserById(id) {
  return db.prepare("SELECT id, username, display_name, avatar, profile_id, created_at FROM users WHERE id = ?").get(id) ?? null;
}

export function usernameExists(username) {
  return !!db.prepare("SELECT 1 FROM users WHERE username = ?").get(username);
}
