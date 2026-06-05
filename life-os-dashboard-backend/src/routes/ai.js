import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { createAdvice, readTopics } from "../services/aiService.js";

export const aiRouter = Router();

aiRouter.get("/topics", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: readTopics() });
}));

aiRouter.post("/advice", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: createAdvice(req.body || {}) });
}));
