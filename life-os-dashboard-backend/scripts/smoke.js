import { rmSync } from "node:fs";
import { resolve } from "node:path";

process.env.DB_PATH = "data/smoke.sqlite";

const smokeDb = resolve(process.env.DB_PATH);
for (const suffix of ["", "-wal", "-shm"]) {
  rmSync(`${smokeDb}${suffix}`, { force: true });
}

const { createApp } = await import("../src/app.js");
const { closeDatabase } = await import("../src/db/connection.js");
const app = createApp();
const server = app.listen(0, "127.0.0.1");
await new Promise((resolveListen) => server.once("listening", resolveListen));

try {
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  async function request(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      Origin: "http://127.0.0.1:5173",
      ...(options.headers || {}),
    };
    const response = await fetch(`${baseUrl}${path}`, {
      headers,
      ...options,
    });
    const body = await response.json();
    if (!response.ok) {
      throw new Error(`${options.method || "GET"} ${path} failed: ${JSON.stringify(body)}`);
    }
    return body.data;
  }

  const health = await request("/api/health");
  if (health.status !== "ok") throw new Error("health status mismatch");

  const dashboardResponse = await fetch(`${baseUrl}/api/dashboard`, {
    headers: { Origin: "http://127.0.0.1:5173" },
  });
  if (dashboardResponse.headers.get("access-control-allow-origin") !== "http://127.0.0.1:5173") {
    throw new Error("CORS origin mismatch");
  }
  const dashboardPayload = await dashboardResponse.json();
  const dashboard = dashboardPayload.data;
  if (!dashboard.profile || dashboard.bugs.length === 0) {
    throw new Error("dashboard seed data missing");
  }

  const bug = await request("/api/bugs", {
    method: "POST",
    body: JSON.stringify({ text: "smoke test bug", severity: "low" }),
  });
  if (!bug.id || bug.status !== "open") throw new Error("bug create response mismatch");

  const bugsAfterCreate = await request("/api/bugs");
  if (!bugsAfterCreate.some((item) => item.id === bug.id)) {
    throw new Error("created bug was not listed");
  }

  const patchedBug = await request(`/api/bugs/${bug.id}`, {
    method: "PATCH",
    body: JSON.stringify({ text: "smoke test bug patched", severity: "high" }),
  });
  if (patchedBug.text !== "smoke test bug patched" || patchedBug.severity !== "high") {
    throw new Error("bug patch response mismatch");
  }

  const resolved = await request(`/api/bugs/${bug.id}/resolve`, {
    method: "POST",
    body: JSON.stringify({ xpDelta: 120 }),
  });
  if (resolved.profile.xp <= dashboard.profile.xp) {
    throw new Error("XP did not increase after resolving bug");
  }

  const profileAfterResolve = await request("/api/profile");
  if (profileAfterResolve.xp !== resolved.profile.xp) {
    throw new Error("profile XP did not persist after resolving bug");
  }

  const xp = await request("/api/xp");
  if (!xp.events.some((event) => event.sourceId === bug.id && event.delta === 120)) {
    throw new Error("XP event for resolved bug missing");
  }

  const manualXp = await request("/api/xp/events", {
    method: "POST",
    body: JSON.stringify({ delta: 30, reason: "manual smoke adjustment", sourceId: "smoke" }),
  });
  if (manualXp.profile.xp !== resolved.profile.xp + 30) {
    throw new Error("manual XP did not persist");
  }
  if (manualXp.event.delta !== 30 || manualXp.event.sourceType !== "manual") {
    throw new Error("manual XP event response mismatch");
  }

  const goal = await request("/api/goals", {
    method: "POST",
    body: JSON.stringify({ ownerType: "self", label: "smoke test goal", progress: 10 }),
  });
  const patchedGoal = await request(`/api/goals/${goal.id}`, {
    method: "PATCH",
    body: JSON.stringify({ progress: 35 }),
  });
  if (patchedGoal.progress !== 35) {
    throw new Error("goal patch response mismatch");
  }

  const advice = await request("/api/ai/advice", {
    method: "POST",
    body: JSON.stringify({ topic: "✨ MVP 전략" }),
  });
  if (advice.mode !== "static") throw new Error("AI advice mode mismatch");

  const vault = await request("/api/vault/unlock", { method: "POST", body: JSON.stringify({}) });
  if (vault.mode !== "demo") throw new Error("vault mode mismatch");

  const vaultItems = await request("/api/vault/items");
  const updatedVaultItem = await request(`/api/vault/items/${vaultItems[0].id}`, {
    method: "PATCH",
    body: JSON.stringify({ progress: 95 }),
  });
  if (updatedVaultItem.progress !== 95) {
    throw new Error("vault item patch response mismatch");
  }

  const sync = await request("/api/coop/sync", { method: "POST" });
  if (sync.mode !== "local-demo" || sync.goals.self[0].progress !== 72) {
    throw new Error("coop sync response mismatch");
  }

  const dashboardAfterWrites = await request("/api/dashboard");
  if (dashboardAfterWrites.profile.xp !== manualXp.profile.xp) {
    throw new Error("dashboard did not reflect persisted XP");
  }
  if (!dashboardAfterWrites.goals.self.some((item) => item.id === goal.id && item.progress === 35)) {
    throw new Error("dashboard did not reflect persisted goal");
  }
  if (!dashboardAfterWrites.vaultItems.some((item) => item.id === updatedVaultItem.id && item.progress === 95)) {
    throw new Error("dashboard did not reflect persisted vault item");
  }

  console.log("smoke ok");
} finally {
  await new Promise((resolveClose) => server.close(resolveClose));
  closeDatabase();
  for (const suffix of ["", "-wal", "-shm"]) {
    rmSync(`${smokeDb}${suffix}`, { force: true });
  }
}
