import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { addRoadmapItem, patchRoadmapItem, readRoadmap, removeRoadmapItem } from "../services/roadmapService.js";

export const roadmapRouter = Router();

roadmapRouter.get("/", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: readRoadmap() });
}));

roadmapRouter.post("/", requireAuth, asyncHandler(async (req, res) => {
  res.status(201).json({ data: addRoadmapItem(req.body || {}) });
}));

roadmapRouter.patch("/:id", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: patchRoadmapItem(req.params.id, req.body || {}) });
}));

roadmapRouter.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: removeRoadmapItem(req.params.id) });
}));
