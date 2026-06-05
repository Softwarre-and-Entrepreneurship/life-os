import React from "react";

export default function XpBar({ xp, xpTarget = 5000, level = 1 }) {
  const xpPct = Math.min(100, (xp / xpTarget) * 100).toFixed(1);

  return (
    <div className="xp-bar-wrap">
      <div className="xp-label-left">
        <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 10 }}>LEVEL&nbsp;</span>
        <span>{level}</span>
        <span style={{ color: "var(--muted)", fontSize: 10, marginLeft: 6 }}>XP</span>
      </div>
      <div className="xp-track">
        <div className="xp-fill" style={{ width: `${xpPct}%` }} />
      </div>
      <div className="xp-right">
        <span className="xp-lvl">{xp.toLocaleString()}</span>
        <span>/ {xpTarget.toLocaleString()} XP</span>
      </div>
    </div>
  );
}
