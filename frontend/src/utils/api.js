const BASE = `${import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:4000"}/api`;

function getToken() {
  return localStorage.getItem("los_token");
}

export function saveToken(token) {
  localStorage.setItem("los_token", token);
}

export function clearToken() {
  localStorage.removeItem("los_token");
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || "API 오류");
  return json.data;
}

export const api = {
  // Auth
  login: (body) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body) => apiFetch("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  logout: () => apiFetch("/auth/logout", { method: "POST", body: JSON.stringify({}) }),
  getMe: () => apiFetch("/auth/me"),

  // Dashboard
  getDashboard: () => apiFetch("/dashboard"),

  // Bugs
  getBugs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/bugs${q ? "?" + q : ""}`);
  },
  addBug: (body) => apiFetch("/bugs", { method: "POST", body: JSON.stringify(body) }),
  resolveBug: (id) => apiFetch(`/bugs/${id}/resolve`, { method: "POST", body: JSON.stringify({}) }),
  deleteBug: (id) => apiFetch(`/bugs/${id}`, { method: "DELETE" }),
  patchBug: (id, body) => apiFetch(`/bugs/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  // Goals
  getGoals: () => apiFetch("/goals"),
  patchGoal: (id, body) => apiFetch(`/goals/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  // AI
  getAiTopics: () => apiFetch("/ai/topics"),
  getAiAdvice: (topic) => apiFetch("/ai/advice", { method: "POST", body: JSON.stringify({ topic }) }),

  // Vault
  unlockVault: () => apiFetch("/vault/unlock", { method: "POST", body: JSON.stringify({}) }),
  getVaultItems: () => apiFetch("/vault/items"),
  patchVaultItem: (id, body) => apiFetch(`/vault/items/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  // Coop
  getCoopStatus: () => apiFetch("/coop/status"),
  syncCoop: () => apiFetch("/coop/sync", { method: "POST", body: JSON.stringify({}) }),

  // Roadmap
  getRoadmap: () => apiFetch("/roadmap"),
  addRoadmapItem: (body) => apiFetch("/roadmap", { method: "POST", body: JSON.stringify(body) }),
  patchRoadmapItem: (id, body) => apiFetch(`/roadmap/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteRoadmapItem: (id) => apiFetch(`/roadmap/${id}`, { method: "DELETE" }),

  // Vault Notes
  getVaultNote: (itemId) => apiFetch(`/vault/notes/${itemId}`),
  saveVaultNote: (itemId, body) => apiFetch(`/vault/notes/${itemId}`, { method: "PUT", body: JSON.stringify(body) }),
  verifyLetterPassword: (itemId, password) => apiFetch(`/vault/notes/${itemId}/verify`, { method: "POST", body: JSON.stringify({ password }) }),

  // XP / Profile
  getXp: () => apiFetch("/xp"),
  getProfile: () => apiFetch("/profile"),
  patchProfile: (body) => apiFetch("/profile", { method: "PATCH", body: JSON.stringify(body) }),
};
