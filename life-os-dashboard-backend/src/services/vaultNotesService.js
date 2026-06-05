import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getVaultItem } from "../repositories/vaultRepository.js";
import { getVaultNote, upsertVaultNote } from "../repositories/vaultNotesRepository.js";
import { httpError } from "../utils/httpError.js";

const KEYLEN = 64;
function hash(password, salt) {
  return scryptSync(password, salt, KEYLEN).toString("hex");
}
function verify(password, salt, storedHash) {
  const derived = scryptSync(password, salt, KEYLEN);
  const stored = Buffer.from(storedHash, "hex");
  return derived.length === stored.length && timingSafeEqual(derived, stored);
}

export function readVaultNote(vaultItemId) {
  if (!getVaultItem(vaultItemId)) throw httpError(404, "NOT_FOUND", "vault item not found");
  const note = getVaultNote(vaultItemId);
  if (!note) return { vault_item_id: vaultItemId, content: "", unlock_date: null, has_password: false };
  return {
    vault_item_id: note.vault_item_id,
    content: note.content,
    unlock_date: note.unlock_date,
    has_password: !!note.letter_password_hash,
    updated_at: note.updated_at,
  };
}

export function saveVaultNote(vaultItemId, payload) {
  if (!getVaultItem(vaultItemId)) throw httpError(404, "NOT_FOUND", "vault item not found");

  let letterPasswordHash, letterSalt;
  if (payload.letterPassword) {
    letterSalt = randomBytes(16).toString("hex");
    letterPasswordHash = hash(payload.letterPassword, letterSalt);
  }

  const note = upsertVaultNote(vaultItemId, {
    content: payload.content,
    unlockDate: payload.unlockDate,
    letterPasswordHash,
    letterSalt,
  });

  return {
    vault_item_id: note.vault_item_id,
    content: note.content,
    unlock_date: note.unlock_date,
    has_password: !!note.letter_password_hash,
    updated_at: note.updated_at,
  };
}

export function verifyLetterPassword(vaultItemId, password) {
  if (!getVaultItem(vaultItemId)) throw httpError(404, "NOT_FOUND", "vault item not found");
  const note = getVaultNote(vaultItemId);
  if (!note?.letter_password_hash) return { access: true };
  if (!password) throw httpError(400, "INVALID_INPUT", "비밀번호를 입력해주세요");
  const ok = verify(password, note.letter_salt, note.letter_password_hash);
  if (!ok) throw httpError(401, "UNAUTHORIZED", "비밀번호가 올바르지 않습니다");
  return {
    access: true,
    content: note.content,
    unlock_date: note.unlock_date,
  };
}
