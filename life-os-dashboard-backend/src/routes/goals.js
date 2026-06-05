import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { addGoal, patchGoal, readGoals } from "../services/goalService.js";

export const goalsRouter = Router();

goalsRouter.get("/", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: readGoals() });
}));

goalsRouter.post("/", requireAuth, asyncHandler(async (req, res) => {
  res.status(201).json({ data: addGoal(req.body || {}) });
}));

goalsRouter.patch("/:id", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: patchGoal(req.params.id, req.body || {}) });
}));
