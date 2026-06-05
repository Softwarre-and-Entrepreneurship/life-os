import { transaction } from "../db/connection.js";
import {
  createBug,
  deleteBug,
  getBug,
  listBugs,
  resolveBug,
  updateBug,
} from "../repositories/bugRepository.js";
import { addXp } from "../repositories/profileRepository.js";
import { createXpEvent } from "../repositories/xpRepository.js";
import { httpError } from "../utils/httpError.js";
import {
  optionalText,
  requireText,
  validateSeverity,
  validateStatus,
  validateXpDelta,
} from "./validation.js";

export function readBugs(query) {
  return listBugs({
    status: validateStatus(query.status || "open"),
    severity: query.severity ? validateSeverity(query.severity) : undefined,
  });
}

export function addBug(payload) {
  return createBug({
    text: requireText(payload.text, "text"),
    severity: validateSeverity(payload.severity || "med"),
  });
}

export function patchBug(id, payload) {
  const current = getBug(id);
  if (!current) throw httpError(404, "NOT_FOUND", "bug not found");
  return updateBug(id, {
    text: optionalText(payload.text, "text"),
    severity: payload.severity === undefined ? undefined : validateSeverity(payload.severity),
  });
}

export function resolveBugAndAwardXp(id, profileId, payload) {
  const current = getBug(id);
  if (!current) throw httpError(404, "NOT_FOUND", "bug not found");
  if (current.status === "resolved") throw httpError(409, "ALREADY_RESOLVED", "bug is already resolved");

  const xpDelta = validateXpDelta(payload.xpDelta, 120);
  return transaction(() => {
    const bug = resolveBug(id);
    const profile = addXp(profileId, xpDelta);
    const xpEvent = createXpEvent({
      delta: xpDelta,
      reason: "bug resolved",
      sourceType: "bug",
      sourceId: id,
    });
    return { bug, profile, xpEvent };
  });
}

export function removeBug(id) {
  const removed = deleteBug(id);
  if (!removed) throw httpError(404, "NOT_FOUND", "bug not found");
  return { id, deleted: true };
}
