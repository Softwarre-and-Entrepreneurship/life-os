import { useState, useEffect, useRef, useCallback } from "react";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const INITIAL_BUGS = [
  { id: 1, text: "영단어 복습 누락", severity: "high", ts: "2시간 전" },
  { id: 2, text: "운동 스킵 (3일째)", severity: "critical", ts: "1일 전" },
  { id: 3, text: "물 2L 마시기 실패", severity: "low", ts: "오늘" },
  { id: 4, text: "독서 30분 미달성", severity: "med", ts: "오늘" },
];

const AI_RESPONSES = {
  "✨ MVP 전략": `MVP의 본질은 **가장 작은 단위의 가치 증명**입니다.\n\n① 목표 입력 → AI 태스크 분해 → 타임라인 시각화, 이 3단계 루프만 완벽히 작동하면 됩니다. 유언장, 커뮤니티, 소셜 기능은 전부 v2입니다.\n\n② 프롬프트 엔지니어링이 곧 제품 품질입니다. "목표: {goal}, 마감: {date}, 주당 가용시간: {hours}" → JSON 태스크 리스트 반환 형태로 Claude API 연동을 먼저 구현하세요.\n\n③ 사용자 1명이 3번 연속 접속하면 PMF 신호입니다. 기능보다 재방문율을 먼저 측정하세요.`,
  "🏆 피칭 전략": `심사위원이 기억하는 피칭은 **문제→숫자→솔루션→팀** 순서입니다.\n\n① 오프닝: "대학생 78%가 목표를 3주 안에 포기합니다" — 통계로 시작하면 주목도가 3배 올라갑니다.\n\n② 데모는 반드시 라이브로. 슬라이드 캡처 대신 실제 앱에 목표를 입력하고 AI가 로드맵을 생성하는 장면을 보여주세요.\n\n③ 팀 슬라이드는 마지막에. "컴퓨터공학 5인+보안 1인, 모두 실제 구현 경험 보유"라는 문장 하나가 어떤 수상 경력보다 강합니다.`,
  "🎮 게이미피케이션": `지속 가능한 게이미피케이션의 핵심은 **내재적 동기 강화**입니다.\n\n① XP보다 스트릭(연속 달성일)이 강력합니다. Duolingo가 증명했듯, "오늘 끊으면 7일 기록이 사라진다"는 손실 회피 심리가 최고의 리텐션 도구입니다.\n\n② 티어 시스템은 6단계가 최적입니다. Bronze→Silver→Gold→Platinum→Diamond→Mythic. 너무 많으면 천장이 안 보이고, 너무 적으면 성장감이 없습니다.\n\n③ 소셜 압력은 가장 강력한 동기 부여입니다. Co-op 기능에서 파트너의 달성률이 내 화면에 실시간으로 보이는 것만으로도 행동 변화를 이끌어낼 수 있습니다.`,
};

const PARTNER = {
  name: "승희",
  avatar: "SH",
  tier: "PLATINUM III",
  myGoals: [
    { label: "토익 950", pct: 68 },
    { label: "체중 감량", pct: 82 },
    { label: "포트폴리오", pct: 45 },
  ],
  herGoals: [
    { label: "JLPT N2", pct: 77 },
    { label: "코딩 100일", pct: 91 },
    { label: "독서 50권", pct: 38 },
  ],
  anniversary: new Date("2025-02-14"),
};

const SEV_META = {
  critical: { color: "#ef4444", label: "CRITICAL", bg: "rgba(239,68,68,0.12)" },
  high: { color: "#f97316", label: "HIGH", bg: "rgba(249,115,22,0.12)" },
  med: { color: "#eab308", label: "MED", bg: "rgba(234,179,8,0.12)" },
  low: { color: "#10b981", label: "LOW", bg: "rgba(16,185,129,0.12)" },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getDaysFromAnniversary(date) {
  return Math.floor((new Date() - date) / 86400000);
}
function getDaysToNextAnniversary(date) {
  const now = new Date();
  const next = new Date(date);
  next.setFullYear(now.getFullYear());
  if (next < now) next.setFullYear(now.getFullYear() + 1);
  return Math.ceil((next - now) / 86400000);
}

// ─── CSS-IN-JS (template literal) ────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg0: #050810;
  --bg1: #0a0f1e;
  --bg2: #0f1729;
  --glass: rgba(15,23,42,0.8);
  --border: rgba(148,163,184,0.1);
  --border2: rgba(168,85,247,0.3);
  --p: #a855f7;
  --b: #3b82f6;
  --c: #06b6d4;
  --g: #10b981;
  --pk: #ec4899;
  --r: #ef4444;
  --o: #f97316;
  --y: #eab308;
  --txt: #e2e8f0;
  --muted: #64748b;
  --mono: 'Share Tech Mono', monospace;
  --head: 'Rajdhani', sans-serif;
  --body: 'Inter', sans-serif;
}

.los-root {
  display: flex;
  height: 100vh;
  min-height: 600px;
  background: var(--bg0);
  color: var(--txt);
  font-family: var(--body);
  overflow: hidden;
  position: relative;
}

/* grid bg */
.los-root::before {
  content: '';
  position: fixed; inset: 0;
  background-image:
    linear-gradient(rgba(168,85,247,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(168,85,247,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}

/* ── SIDEBAR ── */
.sidebar {
  width: 220px;
  min-width: 220px;
  background: rgba(5,8,16,0.95);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 20px 12px;
  gap: 4px;
  z-index: 10;
  position: relative;
}
.sb-logo {
  display: flex; align-items: center; gap: 10px;
  padding: 0 8px 20px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 8px;
}
.sb-logo-icon {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, var(--p), var(--b));
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  box-shadow: 0 0 20px rgba(168,85,247,0.4);
  flex-shrink: 0;
}
.sb-logo-text { font-family: var(--head); font-size: 17px; font-weight: 700; letter-spacing: 0.05em;
  background: linear-gradient(135deg, #e2e8f0, var(--p)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.sb-logo-sub { font-size: 9px; color: var(--muted); font-family: var(--mono); }

.sb-section { font-size: 9px; color: var(--muted); font-family: var(--mono); letter-spacing: 0.1em;
  padding: 12px 8px 4px; text-transform: uppercase; }

.sb-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px;
  cursor: pointer; transition: all 0.2s;
  border: 1px solid transparent;
  font-size: 13px; font-family: var(--body); font-weight: 500;
  color: var(--muted);
  position: relative;
  user-select: none;
}
.sb-item:hover { background: rgba(168,85,247,0.07); color: #94a3b8; }
.sb-item.active {
  background: rgba(168,85,247,0.12);
  border-color: rgba(168,85,247,0.3);
  color: var(--txt);
}
.sb-item.active .sb-icon { color: var(--p); }
.sb-item.active::before {
  content: '';
  position: absolute; left: 0; top: 20%; bottom: 20%;
  width: 3px; border-radius: 0 2px 2px 0;
  background: var(--p);
  box-shadow: 0 0 8px var(--p);
}
.sb-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
.sb-badge {
  margin-left: auto; font-size: 10px; font-family: var(--mono);
  background: rgba(239,68,68,0.2); color: var(--r);
  border: 1px solid rgba(239,68,68,0.3);
  padding: 1px 6px; border-radius: 20px;
}
.sb-bottom { margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border); }
.sb-user { display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 10px; }
.sb-avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, var(--p), var(--pk));
  display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: white;
  border: 2px solid rgba(168,85,247,0.4); flex-shrink: 0; }
.sb-user-name { font-size: 12px; font-weight: 600; }
.sb-user-tier { font-size: 10px; color: var(--p); font-family: var(--mono); }

/* ── MAIN ── */
.main {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  position: relative; z-index: 1;
  scroll-behavior: smooth;
}
.main::-webkit-scrollbar { width: 4px; }
.main::-webkit-scrollbar-track { background: transparent; }
.main::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.3); border-radius: 2px; }

.page { padding: 20px; animation: fadeIn 0.25s ease; min-height: 100%; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

/* ── TOP BAR ── */
.topbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.topbar-title { font-family: var(--head); font-size: 22px; font-weight: 700; letter-spacing: 0.03em;
  background: linear-gradient(135deg, #e2e8f0, var(--p)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.topbar-sub { font-size: 11px; color: var(--muted); font-family: var(--mono); margin-top: 2px; }
.topbar-right { display: flex; align-items: center; gap: 8px; }
.pill-online { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--g);
  background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25);
  padding: 5px 12px; border-radius: 20px; font-family: var(--mono); }
.pulse { width: 6px; height: 6px; border-radius: 50%; background: var(--g); animation: pulse 1.5s infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

/* ── XP BAR ── */
.xp-bar-wrap { background: rgba(10,15,30,0.9); border: 1px solid var(--border); border-radius: 12px;
  padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 16px; }
.xp-label-left { font-family: var(--mono); font-size: 11px; }
.xp-label-left span { color: var(--p); font-size: 14px; font-weight: 700; }
.xp-track { flex: 1; height: 8px; background: rgba(99,102,241,0.12); border-radius: 10px; overflow: hidden; position: relative; }
.xp-fill { height: 100%; background: linear-gradient(90deg, var(--p), var(--c));
  border-radius: 10px; box-shadow: 0 0 10px var(--p); transition: width 0.6s cubic-bezier(0.34,1.56,0.64,1); position: relative; }
.xp-fill::after { content: ''; position: absolute; right: 0; top: 0; bottom: 0; width: 20px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3)); animation: shimmer 1.5s infinite; }
@keyframes shimmer { 0%{opacity:0} 50%{opacity:1} 100%{opacity:0} }
.xp-right { font-family: var(--mono); font-size: 11px; color: var(--muted); white-space: nowrap; }
.xp-lvl { font-size: 13px; font-weight: 700; color: var(--c); margin-right: 4px; }

/* ── CARD ── */
.card {
  background: var(--glass);
  border: 1px solid var(--border);
  border-radius: 16px; padding: 16px;
  backdrop-filter: blur(20px);
  transition: border-color 0.3s, box-shadow 0.3s;
  position: relative; overflow: hidden;
}
.card::before { content: ''; position: absolute; inset: 0; border-radius: 16px;
  background: rgba(99,102,241,0.03); pointer-events: none; }
.card:hover { border-color: rgba(168,85,247,0.25); }
.card-title { font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: 0.1em;
  text-transform: uppercase; margin-bottom: 14px; display: flex; align-items: center; gap: 6px; }
.card-title-icon { font-size: 14px; }

.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }

/* ── TIER ── */
.tier-ring-wrap { display: flex; flex-direction: column; align-items: center; }
.tier-ring { width: 90px; height: 90px; border-radius: 50%;
  background: conic-gradient(from 180deg, var(--p), var(--b), var(--c), var(--p));
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 32px rgba(168,85,247,0.5), 0 0 64px rgba(168,85,247,0.2);
  animation: huerot 6s linear infinite; position: relative; }
@keyframes huerot { to { filter: hue-rotate(360deg); } }
.tier-ring-inner { position: absolute; inset: 4px; border-radius: 50%; background: var(--bg1);
  display: flex; align-items: center; justify-content: center; font-size: 32px; }
.tier-name { font-family: var(--head); font-size: 18px; font-weight: 700; letter-spacing: 0.08em; margin-top: 10px;
  background: linear-gradient(135deg, var(--p), var(--c)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.tier-sub { font-size: 10px; color: var(--muted); margin-top: 2px; font-family: var(--mono); }

.stat-mini { background: rgba(99,102,241,0.07); border: 1px solid rgba(99,102,241,0.15);
  border-radius: 10px; padding: 8px; text-align: center; }
.stat-val { font-family: var(--head); font-size: 18px; font-weight: 700; }
.stat-key { font-size: 9px; color: var(--muted); margin-top: 2px; font-family: var(--mono); }

/* ── TIMELINE ── */
.tl { position: relative; padding-left: 18px; }
.tl::before { content: ''; position: absolute; left: 5px; top: 0; bottom: 0; width: 2px;
  background: linear-gradient(180deg, var(--p) 0%, var(--b) 60%, rgba(99,102,241,0.1) 100%); }
.tl-item { position: relative; margin-bottom: 12px; padding-left: 12px; }
.tl-dot { position: absolute; left: -20px; top: 5px; width: 10px; height: 10px; border-radius: 50%; border: 2px solid; }
.tl-dot-done { background: var(--g); border-color: var(--g); box-shadow: 0 0 8px var(--g); }
.tl-dot-active { background: var(--p); border-color: var(--p); box-shadow: 0 0 10px var(--p); animation: pulse 1.5s infinite; }
.tl-dot-pending { background: transparent; border-color: #334155; }
.tl-title { font-size: 12px; font-weight: 600; }
.tl-date { font-size: 10px; color: var(--muted); margin-top: 2px; font-family: var(--mono); }
.tl-prog { height: 3px; background: rgba(99,102,241,0.1); border-radius: 4px; margin-top: 5px; overflow: hidden; }
.tl-prog-fill { height: 100%; background: linear-gradient(90deg, var(--p), var(--c)); border-radius: 4px; }

.deadline-banner { background: linear-gradient(135deg, rgba(168,85,247,0.1), rgba(59,130,246,0.1));
  border: 1px solid rgba(168,85,247,0.2); border-radius: 12px; padding: 12px; margin-bottom: 14px;
  display: flex; align-items: center; justify-content: space-between; }
.dl-days { font-family: var(--head); font-size: 32px; font-weight: 800; color: var(--p); line-height: 1; }
.dl-label { font-size: 10px; color: var(--muted); font-family: var(--mono); margin-top: 2px; }

/* ── BUG TRACKER ── */
.bug-input-row { display: flex; gap: 8px; margin-bottom: 16px; }
.bug-input {
  flex: 1; background: rgba(10,15,30,0.9); border: 1px solid var(--border);
  border-radius: 10px; padding: 10px 14px; color: var(--txt); font-family: var(--body); font-size: 13px;
  outline: none; transition: border-color 0.2s;
}
.bug-input:focus { border-color: var(--p); box-shadow: 0 0 0 2px rgba(168,85,247,0.15); }
.bug-input::placeholder { color: var(--muted); }
.sev-select {
  background: rgba(10,15,30,0.9); border: 1px solid var(--border);
  border-radius: 10px; padding: 10px 10px; color: var(--txt); font-family: var(--mono); font-size: 11px;
  outline: none; cursor: pointer;
}
.btn-add {
  background: linear-gradient(135deg, var(--p), var(--b));
  border: none; border-radius: 10px; padding: 10px 16px;
  color: white; font-family: var(--mono); font-size: 12px; font-weight: 600;
  cursor: pointer; transition: opacity 0.2s, transform 0.1s;
  white-space: nowrap;
}
.btn-add:hover { opacity: 0.9; }
.btn-add:active { transform: scale(0.97); }

.bug-list { display: flex; flex-direction: column; gap: 8px; }
.bug-item {
  display: flex; align-items: center; gap: 10px;
  background: rgba(10,15,30,0.6); border: 1px solid var(--border);
  border-radius: 10px; padding: 10px 12px;
  transition: all 0.3s; animation: slideIn 0.25s ease;
}
@keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: none; } }
.bug-item.patching { animation: patchOut 0.4s ease forwards; }
@keyframes patchOut { to { opacity: 0; transform: translateX(20px) scale(0.95); height: 0; padding: 0; margin: 0; } }
.bug-sev { font-size: 9px; font-family: var(--mono); padding: 3px 7px; border-radius: 5px;
  font-weight: 700; flex-shrink: 0; border: 1px solid transparent; }
.bug-text { flex: 1; font-size: 12px; }
.bug-ts { font-size: 10px; color: var(--muted); font-family: var(--mono); flex-shrink: 0; }
.btn-patch {
  background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3);
  border-radius: 7px; padding: 5px 10px;
  color: var(--g); font-family: var(--mono); font-size: 10px; font-weight: 700;
  cursor: pointer; transition: all 0.2s; flex-shrink: 0;
}
.btn-patch:hover { background: rgba(16,185,129,0.2); box-shadow: 0 0 10px rgba(16,185,129,0.2); }

.bug-stats { display: flex; gap: 10px; margin-bottom: 14px; }
.bug-stat { flex: 1; background: rgba(10,15,30,0.6); border: 1px solid var(--border); border-radius: 10px; padding: 10px;
  text-align: center; }
.bug-stat-val { font-family: var(--head); font-size: 20px; font-weight: 700; }
.bug-stat-key { font-size: 9px; color: var(--muted); font-family: var(--mono); margin-top: 2px; }

/* ── COOP ── */
.coop-connect {
  background: linear-gradient(135deg, rgba(168,85,247,0.08), rgba(59,130,246,0.08));
  border: 1px solid rgba(168,85,247,0.25); border-radius: 16px; padding: 20px;
  display: flex; align-items: center; gap: 20px; margin-bottom: 16px;
}
.coop-avatar { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 18px; border: 2px solid; flex-shrink: 0; }
.coop-link { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.coop-link-line { width: 100%; height: 2px; background: linear-gradient(90deg, var(--p), var(--c), var(--p));
  border-radius: 2px; animation: flow 2s linear infinite; background-size: 200% 100%; }
@keyframes flow { 0%{background-position:0% 0%} 100%{background-position:200% 0%} }
.coop-link-label { font-size: 10px; color: var(--muted); font-family: var(--mono); }

.coop-dday { display: flex; gap: 10px; margin-bottom: 16px; }
.coop-dday-card { flex: 1; background: rgba(10,15,30,0.6); border: 1px solid var(--border); border-radius: 12px; padding: 14px; text-align: center; }
.coop-dday-num { font-family: var(--head); font-size: 28px; font-weight: 800; }
.coop-dday-label { font-size: 10px; color: var(--muted); font-family: var(--mono); margin-top: 3px; }

.coop-goals { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
.coop-goals-col h4 { font-family: var(--mono); font-size: 10px; color: var(--muted); margin-bottom: 10px; letter-spacing: 0.08em; }
.coop-goal { margin-bottom: 8px; }
.coop-goal-label { font-size: 11px; margin-bottom: 4px; display: flex; justify-content: space-between; }
.coop-goal-pct { font-family: var(--mono); font-size: 10px; }
.coop-goal-bar { height: 5px; background: rgba(99,102,241,0.1); border-radius: 10px; overflow: hidden; }
.coop-goal-fill { height: 100%; border-radius: 10px; transition: width 1.2s cubic-bezier(0.34,1.56,0.64,1); }

.btn-sync {
  width: 100%; padding: 12px; border: 1px solid rgba(168,85,247,0.4);
  border-radius: 12px; background: rgba(168,85,247,0.08);
  color: var(--p); font-family: var(--mono); font-size: 13px; font-weight: 700;
  cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-sync:hover { background: rgba(168,85,247,0.15); box-shadow: 0 0 20px rgba(168,85,247,0.2); }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(168,85,247,0.3); border-top-color: var(--p);
  border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── VAULT ── */
.vault-lock { display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 30px; text-align: center; }
.vault-lock-icon { font-size: 64px; margin-bottom: 16px; animation: float 3s ease-in-out infinite; }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
.vault-lock-title { font-family: var(--head); font-size: 22px; font-weight: 700; margin-bottom: 8px; color: var(--p); }
.vault-lock-sub { font-size: 12px; color: var(--muted); margin-bottom: 20px; font-family: var(--mono); }
.btn-unlock {
  padding: 12px 28px; border: 1px solid var(--p);
  border-radius: 12px; background: linear-gradient(135deg, rgba(168,85,247,0.15), rgba(59,130,246,0.15));
  color: var(--txt); font-family: var(--head); font-size: 16px; font-weight: 700; letter-spacing: 0.1em;
  cursor: pointer; transition: all 0.2s;
}
.btn-unlock:hover { box-shadow: 0 0 24px rgba(168,85,247,0.4); }

.vault-scanning { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; gap: 16px; }
.scan-ring { width: 80px; height: 80px; border-radius: 50%; border: 3px solid rgba(168,85,247,0.2);
  border-top-color: var(--p); animation: spin 1s linear infinite; }
.scan-label { font-family: var(--mono); font-size: 12px; color: var(--p); animation: blink 0.8s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
.scan-bar { width: 200px; height: 4px; background: rgba(99,102,241,0.1); border-radius: 4px; overflow: hidden; }
.scan-fill { height: 100%; background: linear-gradient(90deg, var(--p), var(--c)); border-radius: 4px;
  animation: scanfill 1.8s ease-out forwards; }
@keyframes scanfill { from{width:0} to{width:100%} }

.vault-item { margin-bottom: 12px; }
.vault-item-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.vault-item-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.vault-item-label { font-size: 13px; font-weight: 600; flex: 1; }
.vault-item-pct { font-family: var(--mono); font-size: 12px; font-weight: 700; }
.vault-item-bar { height: 6px; background: rgba(99,102,241,0.1); border-radius: 10px; overflow: hidden; }
.vault-item-fill { height: 100%; border-radius: 10px; transition: width 1.5s cubic-bezier(0.34,1.56,0.64,1); }

/* ── AI PANEL (slide up) ── */
.ai-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  z-index: 100; display: flex; align-items: flex-end; justify-content: center;
  animation: fadeOverlay 0.25s ease;
}
@keyframes fadeOverlay { from{opacity:0} to{opacity:1} }
.ai-panel {
  width: 100%; max-width: 680px; max-height: 70vh;
  background: var(--bg1); border: 1px solid var(--border2);
  border-bottom: none; border-radius: 20px 20px 0 0;
  padding: 24px; overflow-y: auto;
  animation: slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
  font-family: var(--body);
}
@keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
.ai-panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.ai-panel-title { font-family: var(--head); font-size: 18px; font-weight: 700;
  background: linear-gradient(135deg, #e2e8f0, var(--p)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.btn-close { background: rgba(99,102,241,0.1); border: 1px solid var(--border); border-radius: 8px;
  padding: 6px 12px; color: var(--muted); cursor: pointer; font-family: var(--mono); font-size: 11px; transition: all 0.2s; }
.btn-close:hover { color: var(--txt); border-color: var(--p); }
.ai-typing { background: rgba(59,130,246,0.07); border: 1px solid rgba(59,130,246,0.2);
  border-radius: 14px; padding: 16px; font-size: 13px; line-height: 1.8; color: #94a3b8; white-space: pre-wrap; min-height: 80px; }
.ai-typing strong { color: var(--c); }
.ai-cursor { display: inline-block; width: 2px; height: 14px; background: var(--p);
  margin-left: 2px; vertical-align: middle; animation: blink 0.8s infinite; }

/* ── CHIPS ── */
.chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
.chip {
  font-size: 11px; padding: 6px 14px; border-radius: 20px;
  cursor: pointer; border: 1px solid; transition: all 0.2s;
  font-family: var(--mono);
}
.chip:hover { transform: translateY(-2px); }
.chip-p { color: var(--p); border-color: rgba(168,85,247,0.35); background: rgba(168,85,247,0.07); }
.chip-b { color: var(--b); border-color: rgba(59,130,246,0.35); background: rgba(59,130,246,0.07); }
.chip-c { color: var(--c); border-color: rgba(6,182,212,0.35); background: rgba(6,182,212,0.07); }

/* ── CMD CENTER ACHIEVEMENTS ── */
.ach-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.ach { background: rgba(99,102,241,0.07); border: 1px solid rgba(99,102,241,0.15); border-radius: 10px;
  padding: 8px 12px; text-align: center; min-width: 72px; }
.ach.glow-p { border-color: rgba(168,85,247,0.4); box-shadow: 0 0 12px rgba(168,85,247,0.12); }
.ach.glow-c { border-color: rgba(6,182,212,0.4); box-shadow: 0 0 12px rgba(6,182,212,0.12); }
.ach.glow-g { border-color: rgba(16,185,129,0.4); box-shadow: 0 0 12px rgba(16,185,129,0.12); }
.ach-em { font-size: 20px; }
.ach-nm { font-size: 9px; color: var(--muted); margin-top: 3px; font-family: var(--mono); }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .sidebar { width: 56px; min-width: 56px; padding: 16px 8px; }
  .sb-logo-text, .sb-logo-sub, .sb-item span, .sb-section, .sb-user-name, .sb-user-tier { display: none; }
  .sb-item { justify-content: center; padding: 10px; }
  .sb-item::before { display: none; }
  .sb-logo { justify-content: center; padding: 0 0 16px; }
  .sb-badge { display: none; }
  .grid2 { grid-template-columns: 1fr; }
  .coop-goals { grid-template-columns: 1fr; }
}
@media (max-width: 500px) {
  .page { padding: 12px; }
  .grid3 { grid-template-columns: 1fr 1fr; }
  .coop-dday { flex-direction: column; }
}
`;

// ─── TYPING EFFECT HOOK ───────────────────────────────────────────────────────
function useTyping(text, active) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!active) { setDisplayed(""); setDone(false); return; }
    setDisplayed(""); setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, 18);
    return () => clearInterval(id);
  }, [text, active]);
  return { displayed, done };
}

// ─── RENDER BOLD helper ───────────────────────────────────────────────────────
function RenderBold({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>
  );
}

// ─── PAGES ───────────────────────────────────────────────────────────────────

// CMD CENTER
function CommandCenter({ xp, setXp, openAI }) {
  const daysToMvp = Math.ceil((new Date("2026-06-25") - new Date()) / 86400000);
  return (
    <div>
      <div className="grid2" style={{ marginBottom: 12 }}>
        {/* Tier */}
        <div className="card">
          <div className="card-title"><span className="card-title-icon">🛡️</span>인생 티어</div>
          <div className="tier-ring-wrap">
            <div className="tier-ring"><div className="tier-ring-inner">💎</div></div>
            <div className="tier-name">DIAMOND IV</div>
            <div className="tier-sub">상위 8% · 잠재력 폭발 구간</div>
            <div style={{ width: "100%", marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: 5 }}>
                <span>XP {xp} / 5000</span><span style={{ color: "var(--p)" }}>+{Math.round(xp / 50)} 오늘</span>
              </div>
              <div className="xp-track" style={{ height: 6 }}>
                <div className="xp-fill" style={{ width: `${Math.min(100, (xp / 5000) * 100).toFixed(1)}%` }} />
              </div>
            </div>
            <div className="grid3" style={{ marginTop: 10, width: "100%" }}>
              {[["80","실행력","var(--p)"],["75","집중력","var(--b)"],["70","창의성","var(--c)"]].map(([v, k, c]) => (
                <div className="stat-mini" key={k}><div className="stat-val" style={{ color: c }}>{v}</div><div className="stat-key">{k}</div></div>
              ))}
            </div>
          </div>
        </div>
        {/* Roadmap */}
        <div className="card">
          <div className="card-title"><span className="card-title-icon">🗺️</span>데드라인 로드맵</div>
          <div className="deadline-banner">
            <div>
              <div className="dl-days">{daysToMvp > 0 ? `D-${daysToMvp}` : "D-DAY"}</div>
              <div className="dl-label">MVP 출시 · 2026.06.25</div>
            </div>
            <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: "rotate(-90deg)" }} aria-label="진행률 72%">
              <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="4" />
              <circle cx="26" cy="26" r="22" fill="none" stroke="url(#rg)" strokeWidth="4" strokeLinecap="round"
                strokeDasharray="138.2" strokeDashoffset="38.7" />
              <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#06b6d4" />
              </linearGradient></defs>
            </svg>
          </div>
          <div className="tl">
            {[
              { label: "아이템 컨셉 확정", date: "4월 완료", status: "done" },
              { label: "기술 스택 선정", date: "5월 초 완료", status: "done" },
              { label: "AI 로드맵 알고리즘 개발", date: "5월 19일 · 진행 중", status: "active", prog: 65 },
              { label: "MVP 출시 & 내부 테스트", date: "6월 25일", status: "pending" },
              { label: "피드백 반영 & 고도화", date: "7월", status: "pending" },
            ].map((t, i) => (
              <div className="tl-item" key={i}>
                <div className={`tl-dot tl-dot-${t.status}`} />
                <div className="tl-title" style={{ color: t.status === "done" ? "var(--muted)" : t.status === "active" ? "var(--p)" : "#475569",
                  textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.label}</div>
                <div className="tl-date">{t.date}</div>
                {t.prog && <div className="tl-prog"><div className="tl-prog-fill" style={{ width: `${t.prog}%` }} /></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Card */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-title"><span className="card-title-icon">🤖</span>AI 인생 컨설팅</div>
        <div style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.18)", borderRadius: 12, padding: 14, fontSize: 12, color: "#94a3b8", lineHeight: 1.7, marginBottom: 10 }}>
          안녕하세요, <span style={{ color: "var(--c)", fontWeight: 600 }}>김기은</span>님. 오늘 실행력 스탯 <span style={{ color: "var(--c)" }}>+5 상승</span>. MVP 마감까지 {daysToMvp}일 — 충분히 달성 가능합니다. 오늘의 병목: <span style={{ color: "var(--p)" }}>AI 알고리즘 65% 완료</span>. 내일 오전 2시간을 코어 로직에 집중하세요. 🎯
        </div>
        <div className="chips">
          <div className="chip chip-p" onClick={() => openAI("✨ MVP 전략")}>✨ MVP 전략</div>
          <div className="chip chip-b" onClick={() => openAI("🏆 피칭 전략")}>🏆 피칭 전략</div>
          <div className="chip chip-c" onClick={() => openAI("🎮 게이미피케이션")}>🎮 게이미피케이션</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <div className="card-title"><span className="card-title-icon">📊</span>오늘의 성취</div>
        <div className="ach-row">
          {[["🔥","7일 연속","glow-p"],["⚡","집중 3h","glow-c"],["✅","태스크 8","glow-g"],["📚","독서 40m",""],["💪","운동 완료",""]].map(([em, nm, cls]) => (
            <div className={`ach ${cls}`} key={nm}><div className="ach-em">{em}</div><div className="ach-nm">{nm}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// BUG TRACKER
function BugTracker({ bugs, setBugs, xp, setXp }) {
  const [input, setInput] = useState("");
  const [sev, setSev] = useState("med");
  const [patching, setPatching] = useState(null);

  const addBug = () => {
    if (!input.trim()) return;
    setBugs(prev => [{ id: Date.now(), text: input.trim(), severity: sev, ts: "방금" }, ...prev]);
    setInput("");
  };

  const patch = (id) => {
    setPatching(id);
    setTimeout(() => {
      setBugs(prev => prev.filter(b => b.id !== id));
      setXp(prev => Math.min(5000, prev + 120));
      setPatching(null);
    }, 400);
  };

  const sevCount = (s) => bugs.filter(b => b.severity === s).length;

  return (
    <div>
      <div className="bug-stats">
        {["critical","high","med","low"].map(s => (
          <div className="bug-stat" key={s} style={{ borderColor: SEV_META[s].bg }}>
            <div className="bug-stat-val" style={{ color: SEV_META[s].color }}>{sevCount(s)}</div>
            <div className="bug-stat-key">{SEV_META[s].label}</div>
          </div>
        ))}
      </div>
      <div className="bug-input-row">
        <input className="bug-input" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addBug()}
          placeholder="새로운 인생 버그를 입력하세요... (예: 운동 스킵)" />
        <select className="sev-select" value={sev} onChange={e => setSev(e.target.value)}>
          <option value="critical">CRITICAL</option>
          <option value="high">HIGH</option>
          <option value="med">MED</option>
          <option value="low">LOW</option>
        </select>
        <button className="btn-add" onClick={addBug}>+ ADD</button>
      </div>
      <div className="bug-list">
        {bugs.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12 }}>
            🎉 인생 버그 제로! 완벽한 상태입니다.
          </div>
        )}
        {bugs.map(b => (
          <div key={b.id} className={`bug-item${patching === b.id ? " patching" : ""}`}>
            <div className="bug-sev" style={{ color: SEV_META[b.severity].color, background: SEV_META[b.severity].bg, borderColor: SEV_META[b.severity].color }}>
              {SEV_META[b.severity].label}
            </div>
            <div className="bug-text">{b.text}</div>
            <div className="bug-ts">{b.ts}</div>
            <button className="btn-patch" onClick={() => patch(b.id)}>⚡ PATCH</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// VAULT
function EncryptedVault() {
  const [state, setState] = useState("locked"); // locked | scanning | unlocked
  const vaultItems = [
    { icon: "📜", label: "가치관 선언문", pct: 90, color: "linear-gradient(90deg,#a855f7,#7c3aed)", bg: "rgba(168,85,247,0.12)" },
    { icon: "📸", label: "메모리 아카이브", pct: 55, color: "linear-gradient(90deg,#ec4899,#db2777)", bg: "rgba(236,72,153,0.12)" },
    { icon: "💌", label: "미래 편지함", pct: 30, color: "linear-gradient(90deg,#06b6d4,#0891b2)", bg: "rgba(6,182,212,0.12)" },
    { icon: "🔐", label: "디지털 자산 정리", pct: 15, color: "linear-gradient(90deg,#10b981,#059669)", bg: "rgba(16,185,129,0.12)" },
  ];

  const unlock = () => {
    setState("scanning");
    setTimeout(() => setState("unlocked"), 2000);
  };

  if (state === "locked") return (
    <div className="card">
      <div className="vault-lock">
        <div className="vault-lock-icon">🔒</div>
        <div className="vault-lock-title">ENCRYPTED VAULT</div>
        <div className="vault-lock-sub">생체 인증이 필요합니다 · BIOMETRIC REQUIRED</div>
        <button className="btn-unlock" onClick={unlock}>🔓 UNLOCK — 보안 해제</button>
      </div>
    </div>
  );

  if (state === "scanning") return (
    <div className="card">
      <div className="vault-scanning">
        <div className="scan-ring" />
        <div className="scan-label">생체 인식 스캔 중... SCANNING</div>
        <div className="scan-bar"><div className="scan-fill" /></div>
        <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>암호화 해제 중 · DECRYPTING...</div>
      </div>
    </div>
  );

  return (
    <div className="card" style={{ animation: "fadeIn 0.5s ease" }}>
      <div className="card-title"><span className="card-title-icon">🔓</span>디지털 유언장 &amp; 웰다잉 아카이브</div>
      <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "8px 14px", marginBottom: 16, fontSize: 11, fontFamily: "var(--mono)", color: "var(--g)" }}>
        ✓ 인증 완료 · {new Date().toLocaleTimeString("ko-KR")} · 세션 만료: 30분 후
      </div>
      {vaultItems.map((item, i) => (
        <div className="vault-item" key={i} style={{ animationDelay: `${i * 0.1}s`, animation: "fadeIn 0.4s ease both" }}>
          <div className="vault-item-header">
            <div className="vault-item-icon" style={{ background: item.bg }}>{item.icon}</div>
            <div className="vault-item-label">{item.label}</div>
            <div className="vault-item-pct" style={{ background: item.color, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{item.pct}%</div>
          </div>
          <div className="vault-item-bar">
            <div className="vault-item-fill" style={{ width: `${item.pct}%`, background: item.color }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(236,72,153,0.07)", border: "1px solid rgba(236,72,153,0.2)", borderRadius: 10, fontSize: 11, color: "#94a3b8" }}>
        💡 <span style={{ color: "var(--pk)" }}>웰다잉 TIP</span> — 오늘 미래 편지함에 1개 메시지를 남겨보세요.
      </div>
    </div>
  );
}

// COOP
function CoopSync() {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [syncPct, setSyncPct] = useState({ my: [68, 82, 45], her: [77, 91, 38] });
  const days = getDaysFromAnniversary(PARTNER.anniversary);
  const nextAnn = getDaysToNextAnniversary(PARTNER.anniversary);

  const doSync = () => {
    setSyncing(true); setSynced(false);
    setTimeout(() => {
      setSynced(true); setSyncing(false);
      setSyncPct({ my: [72, 85, 52], her: [80, 94, 44] });
    }, 2200);
  };

  return (
    <div>
      <div className="coop-connect">
        <div>
          <div className="coop-avatar" style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", borderColor: "rgba(168,85,247,0.5)", color: "white" }}>KE</div>
          <div style={{ fontSize: 11, textAlign: "center", marginTop: 6, fontFamily: "var(--mono)", color: "var(--muted)" }}>나</div>
        </div>
        <div className="coop-link">
          <div className="coop-link-line" />
          <div className="coop-link-label">💑 CONNECTED · DIAMOND ↔ PLATINUM</div>
          <div className="coop-link-line" />
        </div>
        <div>
          <div className="coop-avatar" style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)", borderColor: "rgba(59,130,246,0.5)", color: "white" }}>{PARTNER.avatar}</div>
          <div style={{ fontSize: 11, textAlign: "center", marginTop: 6, fontFamily: "var(--mono)", color: "var(--muted)" }}>{PARTNER.name}</div>
        </div>
      </div>

      <div className="coop-dday">
        <div className="coop-dday-card">
          <div className="coop-dday-num" style={{ color: "var(--pk)" }}>{days}일</div>
          <div className="coop-dday-label">함께한 날</div>
        </div>
        <div className="coop-dday-card">
          <div className="coop-dday-num" style={{ color: "var(--c)" }}>D-{nextAnn}</div>
          <div className="coop-dday-label">다음 기념일</div>
        </div>
        <div className="coop-dday-card">
          <div className="coop-dday-num" style={{ color: "var(--g)" }}>+1</div>
          <div className="coop-dday-label">년 단위</div>
        </div>
      </div>

      <div className="coop-goals">
        <div className="coop-goals-col">
          <h4>나의 목표</h4>
          {PARTNER.myGoals.map((g, i) => (
            <div className="coop-goal" key={i}>
              <div className="coop-goal-label">
                <span>{g.label}</span>
                <span className="coop-goal-pct" style={{ color: "var(--p)" }}>{syncPct.my[i]}%</span>
              </div>
              <div className="coop-goal-bar">
                <div className="coop-goal-fill" style={{ width: `${syncPct.my[i]}%`, background: "linear-gradient(90deg,#a855f7,#7c3aed)" }} />
              </div>
            </div>
          ))}
        </div>
        <div className="coop-goals-col">
          <h4>{PARTNER.name}의 목표</h4>
          {PARTNER.herGoals.map((g, i) => (
            <div className="coop-goal" key={i}>
              <div className="coop-goal-label">
                <span>{g.label}</span>
                <span className="coop-goal-pct" style={{ color: "var(--c)" }}>{syncPct.her[i]}%</span>
              </div>
              <div className="coop-goal-bar">
                <div className="coop-goal-fill" style={{ width: `${syncPct.her[i]}%`, background: "linear-gradient(90deg,#06b6d4,#0891b2)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {synced && (
        <div style={{ textAlign: "center", fontSize: 11, fontFamily: "var(--mono)", color: "var(--g)", marginBottom: 10,
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "8px" }}>
          ✓ 동기화 완료 · {new Date().toLocaleTimeString("ko-KR")}
        </div>
      )}
      <button className="btn-sync" onClick={doSync} disabled={syncing}>
        {syncing ? <><div className="spinner" /> SYNCING...</> : "🔄 SYNC — 목표 동기화"}
      </button>
    </div>
  );
}

// ─── AI PANEL ────────────────────────────────────────────────────────────────
function AIPanel({ topic, onClose }) {
  const text = AI_RESPONSES[topic] || "";
  const { displayed, done } = useTyping(text, !!topic);
  return (
    <div className="ai-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ai-panel">
        <div className="ai-panel-header">
          <div className="ai-panel-title">🤖 AI 인생 컨설팅 — {topic}</div>
          <button className="btn-close" onClick={onClose}>✕ 닫기</button>
        </div>
        <div className="ai-typing">
          <RenderBold text={displayed} />
          {!done && <span className="ai-cursor" />}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
const NAV = [
  { id: "home", icon: "⚡", label: "Command Center" },
  { id: "bugs", icon: "🐛", label: "Bug Tracker", badge: true },
  { id: "vault", icon: "🔒", label: "Encrypted Vault" },
  { id: "coop", icon: "💑", label: "Co-op Sync" },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [xp, setXp] = useState(3600);
  const [bugs, setBugs] = useState(INITIAL_BUGS);
  const [aiTopic, setAiTopic] = useState(null);

  const xpPct = Math.min(100, (xp / 5000) * 100).toFixed(1);

  return (
    <>
      <style>{CSS}</style>
      <div className="los-root">
        {/* Sidebar */}
        <nav className="sidebar">
          <div className="sb-logo">
            <div className="sb-logo-icon">⚡</div>
            <div>
              <div className="sb-logo-text">Life OS</div>
              <div className="sb-logo-sub">v2.0 · BETA</div>
            </div>
          </div>
          <div className="sb-section">NAVIGATION</div>
          {NAV.map(n => (
            <div key={n.id} className={`sb-item${page === n.id ? " active" : ""}`} onClick={() => setPage(n.id)}>
              <span className="sb-icon">{n.icon}</span>
              <span>{n.label}</span>
              {n.badge && bugs.length > 0 && <span className="sb-badge">{bugs.length}</span>}
            </div>
          ))}
          <div className="sb-bottom">
            <div className="sb-user">
              <div className="sb-avatar">KE</div>
              <div>
                <div className="sb-user-name">김기은</div>
                <div className="sb-user-tier">DIAMOND IV</div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main */}
        <main className="main">
          {/* XP Bar (always visible) */}
          <div className="xp-bar-wrap">
            <div className="xp-label-left">
              <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 10 }}>LEVEL&nbsp;</span>
              <span>12</span>
              <span style={{ color: "var(--muted)", fontSize: 10, marginLeft: 6 }}>XP</span>
            </div>
            <div className="xp-track">
              <div className="xp-fill" style={{ width: `${xpPct}%` }} />
            </div>
            <div className="xp-right">
              <span className="xp-lvl">{xp.toLocaleString()}</span>
              <span>/ 5,000 XP</span>
            </div>
          </div>

          <div className="page" key={page}>
            {/* Topbar */}
            <div className="topbar">
              <div>
                <div className="topbar-title">
                  {page === "home" && "Command Center"}
                  {page === "bugs" && "Life Bug Tracker"}
                  {page === "vault" && "Encrypted Vault"}
                  {page === "coop" && "Co-op & Sync"}
                </div>
                <div className="topbar-sub">2026.05.19 · 시즌 2 · {new Date().toLocaleTimeString("ko-KR")}</div>
              </div>
              <div className="topbar-right">
                <div className="pill-online"><div className="pulse" />AI 연결됨</div>
              </div>
            </div>

            {/* Page Content */}
            {page === "home" && <CommandCenter xp={xp} setXp={setXp} openAI={setAiTopic} />}
            {page === "bugs" && <BugTracker bugs={bugs} setBugs={setBugs} xp={xp} setXp={setXp} />}
            {page === "vault" && <EncryptedVault />}
            {page === "coop" && <CoopSync />}
          </div>
        </main>

        {/* AI Panel */}
        {aiTopic && <AIPanel topic={aiTopic} onClose={() => setAiTopic(null)} />}
      </div>
    </>
  );
}
