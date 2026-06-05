import { applyLocalSync, getPartner } from "../repositories/coopRepository.js";
import { listGoals } from "../repositories/goalRepository.js";

export function readCoopStatus() {
  return {
    partner: getPartner(),
    goals: {
      self: listGoals("self"),
      partner: listGoals("partner"),
    },
  };
}

export function syncLocalCoop() {
  const syncedAt = applyLocalSync();
  return {
    synced: true,
    mode: "local-demo",
    syncedAt,
    goals: {
      self: listGoals("self"),
      partner: listGoals("partner"),
    },
  };
}
