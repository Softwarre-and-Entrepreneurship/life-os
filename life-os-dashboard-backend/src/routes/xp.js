import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { createManualXpEvent, readXp } from "../services/profileService.js";

export const xpRouter = Router();

xpRouter.get("/", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: readXp(req.profileId) });
}));

xpRouter.post("/events", requireAuth, asyncHandler(async (req, res) => {
  res.status(201).json({ data: createManualXpEvent(req.profileId, req.body || {}) });
}));
