import { db } from "../db/connection.js";
import { createId } from "../utils/ids.js";
import { nowIso } from "../utils/time.js";

function toXpEvent(row) {
  return {
    id: row.id,
    delta: row.delta,
    reason: row.reason,
    sourceType: row.source_type,
    sourceId: row.source_id,
    createdAt: row.created_at,
  };
}

export function listXpEvents() {
  return db
    .prepare("SELECT * FROM xp_events ORDER BY created_at DESC")
    .all()
    .map(toXpEvent);
}

export function createXpEvent({ delta, reason, sourceType, sourceId = null }) {
  const id = createId("xp");
  const timestamp = nowIso();
  db.prepare(`
    INSERT INTO xp_events (id, delta, reason, source_type, source_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, delta, reason, sourceType, sourceId, timestamp);

  return toXpEvent(db.prepare("SELECT * FROM xp_events WHERE id = ?").get(id));
}
