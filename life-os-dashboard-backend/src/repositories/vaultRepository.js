import { db } from "../db/connection.js";
import { nowIso } from "../utils/time.js";

function toVaultItem(row) {
  if (!row) return null;
  return {
    id: row.id,
    label: row.label,
    progress: row.progress,
    icon: row.icon,
    category: row.category,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listVaultItems() {
  return db.prepare("SELECT * FROM vault_items ORDER BY created_at ASC").all().map(toVaultItem);
}

export function getVaultItem(id) {
  return toVaultItem(db.prepare("SELECT * FROM vault_items WHERE id = ?").get(id));
}

export function updateVaultItem(id, { progress }) {
  db.prepare("UPDATE vault_items SET progress = ?, updated_at = ? WHERE id = ?").run(progress, nowIso(), id);
  return getVaultItem(id);
}
