import { listBugs } from "../repositories/bugRepository.js";
import { getPartner } from "../repositories/coopRepository.js";
import { listGoals } from "../repositories/goalRepository.js";
import { getProfile } from "../repositories/profileRepository.js";
import { listVaultItems } from "../repositories/vaultRepository.js";

export function readDashboard(profileId) {
  return {
    profile: getProfile(profileId),
    bugs: listBugs({ status: "open" }),
    goals: {
      self: listGoals("self"),
      partner: listGoals("partner"),
    },
    partner: getPartner(),
    vaultItems: listVaultItems(),
  };
}
