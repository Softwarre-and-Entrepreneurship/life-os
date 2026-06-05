import React, { useState, useEffect } from "react";
import { api } from "../utils/api";

const TIER_ICONS = { BRONZE: "🥉", SILVER: "🥈", GOLD: "🥇", PLATINUM: "💠", DIAMOND: "💎", MYTHIC: "👑" };
function tierIcon(tier = "") {
  const u = tier.toUpperCase();
  for (const k of Object.keys(TIER_ICONS)) if (u.startsWith(k)) return TIER_ICONS[k];
  return "⚡";
}

const STATUS_STYLE = {
  done: { color: "var(--muted)", textDecoration: "line-through" },
  active: { color: "var(--p)" },
  pending: { color: "#475569" },
};

export default function CommandCenter({ profile, goals, setGoals, openAI }) {
  const [aiTopics, setAiTopics] = useState([]);
  const [roadmap, setRoadmap] = useState([]);

  // 로드맵 편집 상태
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({ label: "", dateLabel: "" });

  // 목표 편집 상태
  const [editGoalId, setEditGoalId] = useState(null);
  const [editGoalProg, setEditGoalProg] = useState(0);

  const daysToMvp = Math.ceil((new Date("2026-06-25") - new Date()) / 86400000);

  useEffect(() => {
    api.getAiTopics().then(setAiTopics).catch(() => {});
    api.getRoadmap().then(setRoadmap).catch(() => {});
  }, []);

  const xp = profile?.xp ?? 0;
  const xpTarget = profile?.xp_target ?? 5000;
  const tier = profile?.tier ?? "BRONZE I";
  const displayName = profile?.display_name ?? "사용자";
  const level = profile?.level ?? 1;
  const xpPct = Math.min(100, (xp / xpTarget) * 100).toFixed(1);
  const selfGoals = goals?.self ?? [];
  const avgProgress = selfGoals.length
    ? Math.round(selfGoals.reduce((s, g) => s + g.progress, 0) / selfGoals.length) : 0;

  // ─── 로드맵 핸들러 ───
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ label: item.label, date_label: item.date_label, status: item.status, progress: item.progress ?? "" });
  };
  const saveEdit = async (id) => {
    const updated = await api.patchRoadmapItem(id, {
      label: editForm.label, dateLabel: editForm.date_label,
      status: editForm.status, progress: editForm.progress !== "" ? Number(editForm.progress) : null,
    });
    setRoadmap(prev => prev.map(r => r.id === id ? updated : r));
    setEditingId(null);
  };
  const completeItem = async (item) => {
    const updated = await api.patchRoadmapItem(item.id, { status: item.status === "done" ? "pending" : "done", progress: null });
    setRoadmap(prev => prev.map(r => r.id === item.id ? updated : r));
  };
  const deleteItem = async (id) => {
    await api.deleteRoadmapItem(id);
    setRoadmap(prev => prev.filter(r => r.id !== id));
  };
  const addItem = async () => {
    if (!newItem.label.trim()) return;
    const created = await api.addRoadmapItem({ label: newItem.label, dateLabel: newItem.dateLabel || "미정", status: "pending", sortOrder: roadmap.length + 1 });
    setRoadmap(prev => [...prev, created]);
    setNewItem({ label: "", dateLabel: "" });
    setAddingItem(false);
  };

  // ─── 목표 핸들러 ───
  const saveGoal = async (id) => {
    const updated = await api.patchGoal(id, { progress: Number(editGoalProg) });
    setGoals(prev => ({ ...prev, self: prev.self.map(g => g.id === id ? { ...g, progress: updated.progress } : g) }));
    setEditGoalId(null);
  };

  return (
    <div>
      <div className="grid2" style={{ marginBottom: 12 }}>
        {/* 인생 티어 */}
        <div className="card">
          <div className="card-title"><span className="card-title-icon">🛡️</span>인생 티어</div>
          <div className="tier-ring-wrap">
            <div className="tier-ring"><div className="tier-ring-inner">{tierIcon(tier)}</div></div>
            <div className="tier-name">{tier}</div>
            <div className="tier-sub">Lv.{level} · 잠재력 폭발 구간</div>
            <div style={{ width: "100%", marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: 5 }}>
                <span>XP {xp} / {xpTarget}</span>
                <span style={{ color: "var(--p)" }}>목표 평균 {avgProgress}%</span>
              </div>
              <div className="xp-track" style={{ height: 6 }}>
                <div className="xp-fill" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
            <div className="grid3" style={{ marginTop: 10, width: "100%" }}>
              {selfGoals.slice(0, 3).map((g, i) => {
                const colors = ["var(--p)", "var(--b)", "var(--c)"];
                return (
                  <div className="stat-mini" key={g.id}>
                    <div className="stat-val" style={{ color: colors[i % 3] }}>{g.progress}%</div>
                    <div className="stat-key">{g.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 데드라인 로드맵 */}
        <div className="card">
          <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span><span className="card-title-icon">🗺️</span>데드라인 로드맵</span>
            <button onClick={() => setAddingItem(true)} style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 7, color: "var(--p)", fontSize: 12, padding: "3px 10px", cursor: "pointer" }}>+ 추가</button>
          </div>
          <div className="deadline-banner">
            <div>
              <div className="dl-days">{daysToMvp > 0 ? `D-${daysToMvp}` : "D-DAY"}</div>
              <div className="dl-label">MVP 출시 · 2026.06.25</div>
            </div>
            <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="4" />
              <circle cx="26" cy="26" r="22" fill="none" stroke="url(#rg)" strokeWidth="4" strokeLinecap="round"
                strokeDasharray="138.2" strokeDashoffset={138.2 * (1 - avgProgress / 100)} />
              <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#06b6d4" />
              </linearGradient></defs>
            </svg>
          </div>

          {/* 새 항목 추가 폼 */}
          {addingItem && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10, padding: 10, background: "rgba(168,85,247,0.07)", borderRadius: 10, border: "1px solid rgba(168,85,247,0.2)" }}>
              <input value={newItem.label} onChange={e => setNewItem(p => ({ ...p, label: e.target.value }))} placeholder="항목 이름" style={miniInput} />
              <input value={newItem.dateLabel} onChange={e => setNewItem(p => ({ ...p, dateLabel: e.target.value }))} placeholder="날짜 (예: 7월 초)" style={miniInput} />
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={addItem} style={smallBtn("#a855f7")}>✓ 저장</button>
                <button onClick={() => setAddingItem(false)} style={smallBtn("#475569")}>취소</button>
              </div>
            </div>
          )}

          <div className="tl">
            {roadmap.map(t => (
              <div className="tl-item" key={t.id}>
                {editingId === t.id ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                    <input value={editForm.label} onChange={e => setEditForm(p => ({ ...p, label: e.target.value }))} style={miniInput} placeholder="이름" />
                    <input value={editForm.date_label} onChange={e => setEditForm(p => ({ ...p, date_label: e.target.value }))} style={miniInput} placeholder="날짜" />
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))} style={{ ...miniInput, flex: 1 }}>
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="done">Done</option>
                      </select>
                      {editForm.status === "active" && (
                        <input type="number" min="0" max="100" value={editForm.progress} onChange={e => setEditForm(p => ({ ...p, progress: e.target.value }))} style={{ ...miniInput, width: 60 }} placeholder="%" />
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => saveEdit(t.id)} style={smallBtn("#a855f7")}>✓ 저장</button>
                      <button onClick={() => setEditingId(null)} style={smallBtn("#475569")}>취소</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`tl-dot tl-dot-${t.status}`} />
                    <div className="tl-title" style={STATUS_STYLE[t.status]}>{t.label}</div>
                    <div className="tl-date">{t.date_label}</div>
                    {t.status === "active" && t.progress != null && (
                      <div className="tl-prog"><div className="tl-prog-fill" style={{ width: `${t.progress}%` }} /></div>
                    )}
                    <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
                      <button onClick={() => completeItem(t)} title={t.status === "done" ? "완료 취소" : "완료"} style={iconBtn}>{t.status === "done" ? "↩" : "✓"}</button>
                      <button onClick={() => startEdit(t)} title="수정" style={iconBtn}>✎</button>
                      <button onClick={() => deleteItem(t.id)} title="삭제" style={{ ...iconBtn, color: "#ef4444" }}>🗑</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI 컨설팅 */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-title"><span className="card-title-icon">🤖</span>AI 인생 컨설팅</div>
        <div style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.18)", borderRadius: 12, padding: 14, fontSize: 12, color: "#94a3b8", lineHeight: 1.7, marginBottom: 10 }}>
          안녕하세요, <span style={{ color: "var(--c)", fontWeight: 600 }}>{displayName}</span>님.
          현재 XP <span style={{ color: "var(--c)" }}>{xp.toLocaleString()}</span> · 목표 달성률 <span style={{ color: "var(--p)" }}>{avgProgress}%</span>.
          MVP 마감까지 {daysToMvp > 0 ? `${daysToMvp}일` : "D-DAY"} — 아래 AI 전략을 확인해보세요. 🎯
        </div>
        <div className="chips">
          {aiTopics.length > 0
            ? aiTopics.map(t => <div key={t.topic} className="chip chip-p" onClick={() => openAI(t.topic)}>{t.topic}</div>)
            : <>
                <div className="chip chip-p" onClick={() => openAI("✨ MVP 전략")}>✨ MVP 전략</div>
                <div className="chip chip-b" onClick={() => openAI("🎮 게이미피케이션")}>🎮 게이미피케이션</div>
                <div className="chip chip-c" onClick={() => openAI("🏆 피칭 전략")}>🏆 피칭 전략</div>
              </>
          }
        </div>
      </div>

      {/* 나의 목표 현황 — 편집 가능 */}
      {selfGoals.length > 0 && (
        <div className="card">
          <div className="card-title"><span className="card-title-icon">🎯</span>나의 목표 현황</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {selfGoals.map((g) => (
              <div key={g.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: "#e2e8f0", fontWeight: 500 }}>{g.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {editGoalId === g.id ? (
                      <>
                        <input
                          type="number" min="0" max="100" value={editGoalProg}
                          onChange={e => setEditGoalProg(e.target.value)}
                          style={{ width: 56, ...miniInput, padding: "3px 8px" }}
                        />
                        <button onClick={() => saveGoal(g.id)} style={smallBtn("#a855f7")}>저장</button>
                        <button onClick={() => setEditGoalId(null)} style={smallBtn("#475569")}>취소</button>
                      </>
                    ) : (
                      <>
                        <span style={{ color: "var(--p)", fontFamily: "var(--mono)", cursor: "pointer", fontWeight: 600 }}
                          onClick={() => { setEditGoalId(g.id); setEditGoalProg(g.progress); }}>
                          {g.progress}%
                        </span>
                        <button onClick={() => { setEditGoalId(g.id); setEditGoalProg(g.progress); }}
                          style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13 }}>✎</button>
                      </>
                    )}
                  </div>
                </div>
                <div className="xp-track" style={{ height: 6 }}>
                  <div className="xp-fill" style={{ width: `${g.progress}%`, transition: "width 0.4s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const miniInput = {
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 7, color: "#e2e8f0", fontSize: 11, padding: "5px 9px",
  fontFamily: "var(--mono)", outline: "none", width: "100%", boxSizing: "border-box",
};
const iconBtn = { background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13, padding: "2px 4px" };
const smallBtn = (c) => ({
  padding: "4px 10px", border: "none", borderRadius: 6, background: `${c}33`,
  color: c, fontSize: 11, fontFamily: "var(--mono)", cursor: "pointer", fontWeight: 600,
});
