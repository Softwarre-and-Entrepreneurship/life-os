import { getVaultItem, listVaultItems, updateVaultItem } from "../repositories/vaultRepository.js";
import { httpError } from "../utils/httpError.js";
import { validateProgress } from "./validation.js";

export function unlockVault() {
  return {
    unlocked: true,
    mode: "demo",
    expiresInSeconds: 1800,
  };
}

export function readVaultItems() {
  return listVaultItems();
}

export function patchVaultItem(id, payload) {
  const current = getVaultItem(id);
  if (!current) {
    throw httpError(404, "NOT_FOUND", "vault item not found");
  }

  return updateVaultItem(id, {
    progress: validateProgress(payload.progress),
  });
}
