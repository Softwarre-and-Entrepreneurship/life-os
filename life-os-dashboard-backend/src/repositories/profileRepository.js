import { db } from "../db/connection.js";
import { nowIso } from "../utils/time.js";

function toProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    display_name: row.display_name,
    avatar: row.avatar,
    tier: row.tier,
    level: row.level,
    xp: row.xp,
    xp_target: row.xp_target,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function getProfile(profileId = "local-user") {
  return toProfile(db.prepare("SELECT * FROM profiles WHERE id = ?").get(profileId));
}

export function updateProfile(profileId = "local-user", { displayName, avatar }) {
  const current = getProfile(profileId);
  if (!current) return null;
  const updated = {
    display_name: displayName ?? current.display_name,
    avatar: avatar ?? current.avatar,
  };
  db.prepare(`
    UPDATE profiles SET display_name = ?, avatar = ?, updated_at = ? WHERE id = ?
  `).run(updated.display_name, updated.avatar, nowIso(), profileId);
  return getProfile(profileId);
}

export function addXp(profileId = "local-user", delta) {
  const current = getProfile(profileId);
  if (!current) return null;
  const nextXp = Math.max(0, Math.min(current.xp_target, current.xp + delta));
  db.prepare("UPDATE profiles SET xp = ?, updated_at = ? WHERE id = ?").run(nextXp, nowIso(), profileId);
  return getProfile(profileId);
}
