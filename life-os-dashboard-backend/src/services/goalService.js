import { createGoal, getGoal, listGoals, updateGoal } from "../repositories/goalRepository.js";
import { httpError } from "../utils/httpError.js";
import { requireText, validateOwnerType, validateProgress } from "./validation.js";

export function readGoals() {
  return {
    self: listGoals("self"),
    partner: listGoals("partner"),
  };
}

export function addGoal(payload) {
  return createGoal({
    ownerType: validateOwnerType(payload.ownerType || "self"),
    label: requireText(payload.label, "label"),
    progress: validateProgress(payload.progress ?? 0),
  });
}

export function patchGoal(id, payload) {
  const current = getGoal(id);
  if (!current) {
    throw httpError(404, "NOT_FOUND", "goal not found");
  }

  return updateGoal(id, {
    label: payload.label === undefined ? undefined : requireText(payload.label, "label"),
    progress: payload.progress === undefined ? undefined : validateProgress(payload.progress),
  });
}
