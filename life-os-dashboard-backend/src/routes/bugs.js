import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { addBug, patchBug, readBugs, removeBug, resolveBugAndAwardXp } from "../services/bugService.js";

export const bugsRouter = Router();

bugsRouter.get("/", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: readBugs(req.query) });
}));

bugsRouter.post("/", requireAuth, asyncHandler(async (req, res) => {
  res.status(201).json({ data: addBug(req.body || {}) });
}));

bugsRouter.patch("/:id", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: patchBug(req.params.id, req.body || {}) });
}));

bugsRouter.post("/:id/resolve", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: resolveBugAndAwardXp(req.params.id, req.profileId, req.body || {}) });
}));

bugsRouter.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: removeBug(req.params.id) });
}));
