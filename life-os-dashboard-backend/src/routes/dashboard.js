import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { readDashboard } from "../services/dashboardService.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: readDashboard(req.profileId) });
}));
