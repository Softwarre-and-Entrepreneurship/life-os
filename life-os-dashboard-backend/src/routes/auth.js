import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { getMe, login, logout, register } from "../services/authService.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(async (req, res) => {
  res.status(201).json({ data: register(req.body || {}) });
}));

authRouter.post("/login", asyncHandler(async (req, res) => {
  res.json({ data: login(req.body || {}) });
}));

authRouter.post("/logout", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: logout(req.authToken) });
}));

authRouter.get("/me", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: getMe(req.authToken) });
}));
