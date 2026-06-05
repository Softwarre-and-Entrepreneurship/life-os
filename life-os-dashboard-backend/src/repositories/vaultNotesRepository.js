import { db } from "../db/connection.js";
import { nowIso } from "../utils/time.js";

export function getVaultNote(vaultItemId) {
  return db.prepare("SELECT * FROM vault_notes WHERE vault_item_id = ?").get(vaultItemId) ?? null;
}

export function upsertVaultNote(vaultItemId, { content, unlockDate, letterPasswordHash, letterSalt }) {
  const now = nowIso();
  const existing = getVaultNote(vaultItemId);
  if (existing) {
    const newContent = content !== undefined ? content : existing.content;
    const newUnlockDate = unlockDate !== undefined ? unlockDate : existing.unlock_date;
    const newHash = letterPasswordHash !== undefined ? letterPasswordHash : existing.letter_password_hash;
    const newSalt = letterSalt !== undefined ? letterSalt : existing.letter_salt;
    db.prepare(`
      UPDATE vault_notes SET content=?, unlock_date=?, letter_password_hash=?, letter_salt=?, updated_at=?
      WHERE vault_item_id=?
    `).run(newContent, newUnlockDate, newHash, newSalt, now, vaultItemId);
  } else {
    db.prepare(`
      INSERT INTO vault_notes (vault_item_id, content, unlock_date, letter_password_hash, letter_salt, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(vaultItemId, content ?? "", unlockDate ?? null, letterPasswordHash ?? null, letterSalt ?? null, now);
  }
  return getVaultNote(vaultItemId);
}
