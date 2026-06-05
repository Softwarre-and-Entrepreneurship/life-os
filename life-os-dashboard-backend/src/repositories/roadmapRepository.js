import { db } from "../db/connection.js";
import { createId } from "../utils/ids.js";
import { nowIso } from "../utils/time.js";

export function listRoadmapItems() {
  return db.prepare("SELECT * FROM roadmap_items ORDER BY sort_order ASC").all();
}

export function getRoadmapItem(id) {
  return db.prepare("SELECT * FROM roadmap_items WHERE id = ?").get(id) ?? null;
}

export function createRoadmapItem({ label, dateLabel, status, progress, sortOrder }) {
  const id = createId("rm");
  const now = nowIso();
  db.prepare(`
    INSERT INTO roadmap_items (id, label, date_label, status, progress, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, label, dateLabel, status ?? "pending", progress ?? null, sortOrder ?? 99, now, now);
  return getRoadmapItem(id);
}

export function updateRoadmapItem(id, fields) {
  const current = getRoadmapItem(id);
  if (!current) return null;
  const label = fields.label ?? current.label;
  const dateLabel = fields.dateLabel ?? current.date_label;
  const status = fields.status ?? current.status;
  const progress = fields.progress !== undefined ? fields.progress : current.progress;
  db.prepare(`
    UPDATE roadmap_items SET label=?, date_label=?, status=?, progress=?, updated_at=? WHERE id=?
  `).run(label, dateLabel, status, progress, nowIso(), id);
  return getRoadmapItem(id);
}

export function deleteRoadmapItem(id) {
  const item = getRoadmapItem(id);
  if (!item) return null;
  db.prepare("DELETE FROM roadmap_items WHERE id=?").run(id);
  return item;
}
