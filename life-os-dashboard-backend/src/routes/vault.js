import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { patchVaultItem, readVaultItems, unlockVault } from "../services/vaultService.js";
import { readVaultNote, saveVaultNote, verifyLetterPassword } from "../services/vaultNotesService.js";

export const vaultRouter = Router();

vaultRouter.post("/unlock", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: unlockVault(req.body || {}) });
}));

vaultRouter.get("/items", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: readVaultItems() });
}));

vaultRouter.patch("/items/:id", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: patchVaultItem(req.params.id, req.body || {}) });
}));

// 볼트 노트 (콘텐츠, 날짜, 비밀번호)
vaultRouter.get("/notes/:itemId", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: readVaultNote(req.params.itemId) });
}));

vaultRouter.put("/notes/:itemId", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: saveVaultNote(req.params.itemId, req.body || {}) });
}));

vaultRouter.post("/notes/:itemId/verify", requireAuth, asyncHandler(async (req, res) => {
  res.json({ data: verifyLetterPassword(req.params.itemId, req.body?.password) });
}));
