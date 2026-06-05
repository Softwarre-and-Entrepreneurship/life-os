import React from "react";
import { NAV } from "../../constants/mockData";

export default function Sidebar({ page, setPage, bugsCount, profile, onLogout }) {
  const avatar = profile?.avatar ?? "??";
  const displayName = profile?.display_name ?? "사용자";
  const tier = profile?.tier ?? "BRONZE I";

  return (
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
        <div
          key={n.id}
          className={`sb-item${page === n.id ? " active" : ""}`}
          onClick={() => setPage(n.id)}
        >
          <span className="sb-icon">{n.icon}</span>
          <span>{n.label}</span>
          {n.badge && bugsCount > 0 && <span className="sb-badge">{bugsCount}</span>}
        </div>
      ))}

      <div className="sb-bottom">
        <div className="sb-user">
          <div className="sb-avatar">{avatar}</div>
          <div style={{ flex: 1 }}>
            <div className="sb-user-name">{displayName}</div>
            <div className="sb-user-tier">{tier}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            marginTop: 10, width: "100%", padding: "7px 0",
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 8, color: "#f87171", fontSize: 11, fontFamily: "var(--mono)",
            cursor: "pointer", letterSpacing: 1, transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
        >
          🚪 로그아웃
        </button>
      </div>
    </nav>
  );
}
