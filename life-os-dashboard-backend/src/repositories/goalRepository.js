import { db } from "../db/connection.js";
import { createId } from "../utils/ids.js";
import { nowIso } from "../utils/time.js";

function toGoal(row) {
  if (!row) return null;
  return {
    id: row.id,
    ownerType: row.owner_type,
    label: row.label,
    progress: row.progress,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listGoals(ownerType) {
  const rows = ownerType
    ? db.prepare("SELECT * FROM goals WHERE owner_type = ? ORDER BY created_at ASC").all(ownerType)
    : db.prepare("SELECT * FROM goals ORDER BY owner_type ASC, created_at ASC").all();
  return rows.map(toGoal);
}

export function getGoal(id) {
  return toGoal(db.prepare("SELECT * FROM goals WHERE id = ?").get(id));
}

export function createGoal({ ownerType, label, progress }) {
  const id = createId("goal");
  const timestamp = nowIso();
  db.prepare(`
    INSERT INTO goals (id, owner_type, label, progress, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, ownerType, label, progress, timestamp, timestamp);
  return getGoal(id);
}

export function updateGoal(id, { label, progress }) {
  const current = getGoal(id);
  db.prepare(`
    UPDATE goals
    SET label = ?, progress = ?, updated_at = ?
    WHERE id = ?
  `).run(label ?? current.label, progress ?? current.progress, nowIso(), id);
  return getGoal(id);
}
