import { db, transaction } from "../db/connection.js";
import { nowIso } from "../utils/time.js";

function toPartner(row) {
  if (!row) return null;
  return {
    id: row.id,
    displayName: row.display_name,
    avatar: row.avatar,
    tier: row.tier,
    anniversary: row.anniversary,
    updatedAt: row.updated_at,
  };
}

export function getPartner() {
  return toPartner(db.prepare("SELECT * FROM coop_profiles LIMIT 1").get());
}

export function applyLocalSync() {
  const timestamp = nowIso();
  const updates = [
    [72, "goal_self_1"],
    [85, "goal_self_2"],
    [52, "goal_self_3"],
    [80, "goal_partner_1"],
    [94, "goal_partner_2"],
    [44, "goal_partner_3"],
  ];

  transaction(() => {
    const stmt = db.prepare("UPDATE goals SET progress = ?, updated_at = ? WHERE id = ?");
    updates.forEach(([progress, id]) => stmt.run(progress, timestamp, id));
    db.prepare("UPDATE coop_profiles SET updated_at = ? WHERE id = ?").run(timestamp, "partner-local");
  });

  return timestamp;
}
