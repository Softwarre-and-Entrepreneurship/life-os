import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { patchProfile, readProfile } from "../services/profileService.js";

export const profileRouter = Router();

profileRouter.get("/", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: readProfile(req.profileId) });
}));

profileRouter.patch("/", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: patchProfile(req.profileId, req.body || {}) });
}));
