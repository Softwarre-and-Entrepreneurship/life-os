import React from "react";

const PAGE_TITLES = {
  home: "Command Center",
  bugs: "Life Bug Tracker",
  vault: "Encrypted Vault",
  coop: "Co-op & Sync",
};

export default function Topbar({ page, onOpenGuide }) {
  return (
    <div className="topbar">
      <div>
        <div className="topbar-title">{PAGE_TITLES[page] ?? page}</div>
        <div className="topbar-sub">
          {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, ".").replace(".", "")} · 시즌 2 · {new Date().toLocaleTimeString("ko-KR")}
        </div>
      </div>
      <div className="topbar-right" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="pill-online">
          <div className="pulse" />
          AI 연결됨
        </div>
        <button
          onClick={onOpenGuide}
          title="사용 가이드"
          style={{
            width: 34, height: 34, borderRadius: "50%", border: "1px solid rgba(168,85,247,0.4)",
            background: "rgba(168,85,247,0.12)", color: "#c084fc",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,85,247,0.25)"; e.currentTarget.style.borderColor = "rgba(168,85,247,0.7)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(168,85,247,0.12)"; e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)"; }}
        >
          ?
        </button>
      </div>
    </div>
  );
}
