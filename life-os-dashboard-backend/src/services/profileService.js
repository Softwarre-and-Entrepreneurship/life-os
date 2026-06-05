import { transaction } from "../db/connection.js";
import { getProfile, updateProfile, addXp } from "../repositories/profileRepository.js";
import { createXpEvent, listXpEvents } from "../repositories/xpRepository.js";
import { optionalText, validateXpDelta } from "./validation.js";

export function readProfile(profileId) {
  return getProfile(profileId);
}

export function patchProfile(profileId, payload) {
  return updateProfile(profileId, {
    displayName: optionalText(payload.displayName, "displayName"),
    avatar: optionalText(payload.avatar, "avatar"),
  });
}

export function readXp(profileId) {
  return {
    profile: getProfile(profileId),
    events: listXpEvents(),
  };
}

export function createManualXpEvent(profileId, payload) {
  const delta = validateXpDelta(payload.delta, 0, "delta");
  return transaction(() => {
    const profile = addXp(profileId, delta);
    const event = createXpEvent({
      delta,
      reason: payload.reason || "manual adjustment",
      sourceType: "manual",
      sourceId: payload.sourceId || null,
    });
    return { profile, event };
  });
}
