import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { readCoopStatus, syncLocalCoop } from "../services/coopService.js";

export const coopRouter = Router();

coopRouter.get("/status", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: readCoopStatus() });
}));

coopRouter.post("/sync", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: syncLocalCoop() });
}));
