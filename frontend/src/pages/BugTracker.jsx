import React, { useState } from "react";
import { SEV_META } from "../constants/mockData";
import { api } from "../utils/api";

function relativeTime(isoString) {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금";
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전`;
  return `${Math.floor(hrs / 24)}일 전`;
}

export default function BugTracker({ bugs, setBugs, profile, setProfile }) {
  const [input, setInput] = useState("");
  const [sev, setSev] = useState("med");
  const [patching, setPatching] = useState(null);
  const [error, setError] = useState(null);

  const addBug = async () => {
    if (!input.trim()) return;
    try {
      const newBug = await api.addBug({ text: input.trim(), severity: sev });
      setBugs(prev => [newBug, ...prev]);
      setInput("");
      setError(null);
    } catch (err) {
      setError("버그 추가 실패: " + err.message);
    }
  };

  const patch = async (id) => {
    setPatching(id);
    try {
      const result = await api.resolveBug(id);
      setBugs(prev => prev.filter(b => b.id !== id));
      if (result.profile && setProfile) {
        setProfile(result.profile);
      } else if (result.xp_event && setProfile) {
        setProfile(prev => prev ? {
          ...prev,
          xp: Math.min(prev.xp_target ?? 5000, (prev.xp ?? 0) + (result.xp_event.delta ?? 0))
        } : prev);
      }
      setError(null);
    } catch (err) {
      setError("패치 실패: " + err.message);
    } finally {
      setPatching(null);
    }
  };

  const deleteBug = async (id) => {
    try {
      await api.deleteBug(id);
      setBugs(prev => prev.filter(b => b.id !== id));
      setError(null);
    } catch (err) {
      setError("삭제 실패: " + err.message);
    }
  };

  const sevCount = (s) => bugs.filter(b => b.severity === s).length;

  return (
    <div>
      <div className="bug-stats">
        {["critical", "high", "med", "low"].map(s => (
          <div className="bug-stat" key={s} style={{ borderColor: SEV_META[s].bg }}>
            <div className="bug-stat-val" style={{ color: SEV_META[s].color }}>{sevCount(s)}</div>
            <div className="bug-stat-key">{SEV_META[s].label}</div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 11, color: "#ef4444", fontFamily: "var(--mono)" }}>
          ⚠ {error}
        </div>
      )}

      <div className="bug-input-row">
        <input
          className="bug-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addBug()}
          placeholder="새로운 인생 버그를 입력하세요... (예: 운동 스킵)"
        />
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
            <div className="bug-sev" style={{ color: SEV_META[b.severity]?.color, background: SEV_META[b.severity]?.bg, borderColor: SEV_META[b.severity]?.color }}>
              {SEV_META[b.severity]?.label ?? b.severity}
            </div>
            <div className="bug-text">{b.text}</div>
            <div className="bug-ts">{relativeTime(b.created_at)}</div>
            <button className="btn-patch" onClick={() => patch(b.id)} disabled={patching === b.id}>
              ⚡ PATCH
            </button>
            <button
              onClick={() => deleteBug(b.id)}
              style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13, padding: "0 4px" }}
              title="삭제"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
