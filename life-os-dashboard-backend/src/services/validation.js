import { httpError } from "../utils/httpError.js";

const severities = new Set(["critical", "high", "med", "low"]);
const statuses = new Set(["open", "resolved", "all"]);
const ownerTypes = new Set(["self", "partner"]);

export function requireText(value, fieldName) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw httpError(400, "VALIDATION_ERROR", `${fieldName} is required`);
  }
  return value.trim();
}

export function optionalText(value, fieldName) {
  if (value === undefined) return undefined;
  return requireText(value, fieldName);
}

export function validateSeverity(value) {
  if (!severities.has(value)) {
    throw httpError(400, "VALIDATION_ERROR", "severity must be one of critical, high, med, low");
  }
  return value;
}

export function validateStatus(value = "open") {
  if (!statuses.has(value)) {
    throw httpError(400, "VALIDATION_ERROR", "status must be one of open, resolved, all");
  }
  return value;
}

export function validateOwnerType(value) {
  if (!ownerTypes.has(value)) {
    throw httpError(400, "VALIDATION_ERROR", "ownerType must be one of self, partner");
  }
  return value;
}

export function validateProgress(value) {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw httpError(400, "VALIDATION_ERROR", "progress must be an integer from 0 to 100");
  }
  return value;
}

export function validateXpDelta(value, fallback = 120, fieldName = "xpDelta") {
  const delta = value ?? fallback;
  if (!Number.isInteger(delta) || delta < 0 || delta > 5000) {
    throw httpError(400, "VALIDATION_ERROR", `${fieldName} must be an integer from 0 to 5000`);
  }
  return delta;
}
