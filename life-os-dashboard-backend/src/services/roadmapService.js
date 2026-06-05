import { createRoadmapItem, deleteRoadmapItem, getRoadmapItem, listRoadmapItems, updateRoadmapItem } from "../repositories/roadmapRepository.js";
import { httpError } from "../utils/httpError.js";
import { requireText } from "./validation.js";

const VALID_STATUS = ["done", "active", "pending"];

function validateStatus(s) {
  if (s !== undefined && !VALID_STATUS.includes(s)) throw httpError(400, "INVALID_INPUT", `status must be one of ${VALID_STATUS.join(", ")}`);
  return s;
}

export function readRoadmap() {
  return listRoadmapItems();
}

export function addRoadmapItem(payload) {
  return createRoadmapItem({
    label: requireText(payload.label, "label"),
    dateLabel: requireText(payload.dateLabel, "dateLabel"),
    status: validateStatus(payload.status) ?? "pending",
    progress: payload.progress ?? null,
    sortOrder: payload.sortOrder ?? 99,
  });
}

export function patchRoadmapItem(id, payload) {
  if (!getRoadmapItem(id)) throw httpError(404, "NOT_FOUND", "roadmap item not found");
  return updateRoadmapItem(id, {
    label: payload.label,
    dateLabel: payload.dateLabel,
    status: validateStatus(payload.status),
    progress: payload.progress,
  });
}

export function removeRoadmapItem(id) {
  const item = deleteRoadmapItem(id);
  if (!item) throw httpError(404, "NOT_FOUND", "roadmap item not found");
  return { id, deleted: true };
}
