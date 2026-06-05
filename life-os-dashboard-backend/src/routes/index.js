import { Router } from "express";
import { authRouter } from "./auth.js";
import { aiRouter } from "./ai.js";
import { bugsRouter } from "./bugs.js";
import { coopRouter } from "./coop.js";
import { dashboardRouter } from "./dashboard.js";
import { goalsRouter } from "./goals.js";
import { healthRouter } from "./health.js";
import { profileRouter } from "./profile.js";
import { roadmapRouter } from "./roadmap.js";
import { vaultRouter } from "./vault.js";
import { xpRouter } from "./xp.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/profile", profileRouter);
apiRouter.use("/xp", xpRouter);
apiRouter.use("/bugs", bugsRouter);
apiRouter.use("/goals", goalsRouter);
apiRouter.use("/ai", aiRouter);
apiRouter.use("/vault", vaultRouter);
apiRouter.use("/roadmap", roadmapRouter);
apiRouter.use("/coop", coopRouter);
