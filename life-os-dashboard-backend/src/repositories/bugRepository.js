import { db } from "../db/connection.js";
import { createId } from "../utils/ids.js";
import { nowIso } from "../utils/time.js";

function toBug(row) {
  if (!row) return null;
  return {
    id: row.id,
    text: row.text,
    severity: row.severity,
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
  };
}

export function listBugs({ status = "open", severity } = {}) {
  const conditions = [];
  const params = [];

  if (status && status !== "all") {
    conditions.push("status = ?");
    params.push(status);
  }

  if (severity) {
    conditions.push("severity = ?");
    params.push(severity);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return db
    .prepare(`SELECT * FROM bugs ${where} ORDER BY created_at DESC`)
    .all(...params)
    .map(toBug);
}

export function getBug(id) {
  return toBug(db.prepare("SELECT * FROM bugs WHERE id = ?").get(id));
}

export function createBug({ text, severity }) {
  const id = createId("bug");
  const timestamp = nowIso();
  db.prepare(`
    INSERT INTO bugs (id, text, severity, status, created_at, resolved_at)
    VALUES (?, ?, ?, 'open', ?, NULL)
  `).run(id, text, severity, timestamp);

  return getBug(id);
}

export function updateBug(id, { text, severity }) {
  const current = getBug(id);
  db.prepare(`
    UPDATE bugs
    SET text = ?, severity = ?
    WHERE id = ?
  `).run(text ?? current.text, severity ?? current.severity, id);
  return getBug(id);
}

export function resolveBug(id) {
  const timestamp = nowIso();
  db.prepare("UPDATE bugs SET status = 'resolved', resolved_at = ? WHERE id = ?").run(timestamp, id);
  return getBug(id);
}

export function deleteBug(id) {
  const result = db.prepare("DELETE FROM bugs WHERE id = ?").run(id);
  return result.changes > 0;
}
