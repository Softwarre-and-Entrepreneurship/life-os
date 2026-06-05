import React, { useState } from "react";

const GUIDES = {
  home: {
    title: "Command Center 가이드",
    sections: [
      {
        icon: "🗺️", title: "데드라인 로드맵 수정",
        desc: "각 항목 우측의 ✎ 버튼을 클릭해 이름·날짜·상태를 수정할 수 있습니다. ✓ 버튼으로 완료 처리, 🗑 버튼으로 삭제, + 버튼으로 새 항목을 추가하세요."
      },
      {
        icon: "🎯", title: "목표 달성률 수정",
        desc: "나의 목표 현황 카드에서 각 목표 우측의 진행률 숫자를 클릭하면 직접 수정할 수 있습니다. 저장하면 인생 티어 카드의 통계도 즉시 반영됩니다."
      },
      {
        icon: "🤖", title: "AI 인생 컨설팅",
        desc: "주제 칩을 클릭하면 해당 주제에 대한 AI 조언을 확인할 수 있습니다. 타이핑 애니메이션으로 표시됩니다."
      },
    ]
  },
  bugs: {
    title: "Bug Tracker 가이드",
    sections: [
      {
        icon: "➕", title: "버그 추가",
        desc: "입력창에 오늘 못 한 일·나쁜 습관을 입력하고 심각도(CRITICAL~LOW)를 선택한 후 ADD 또는 Enter를 누르세요."
      },
      {
        icon: "⚡", title: "버그 해결 (PATCH)",
        desc: "PATCH 버튼을 누르면 버그가 해결 처리되고 XP가 +120 지급됩니다. XP 바에 즉시 반영됩니다."
      },
      {
        icon: "✕", title: "버그 삭제",
        desc: "각 버그 오른쪽 ✕ 버튼으로 XP 없이 삭제할 수 있습니다."
      },
    ]
  },
  vault: {
    title: "Encrypted Vault 가이드",
    sections: [
      {
        icon: "🔓", title: "볼트 잠금 해제",
        desc: "UNLOCK 버튼을 눌러 생체 인증 시뮬레이션 후 볼트에 접근합니다. 세션은 30분간 유지됩니다."
      },
      {
        icon: "📝", title: "내용 작성",
        desc: "각 항목 우측 ✎ 버튼으로 내용을 작성·저장할 수 있습니다. 가치관 선언문, 메모리 아카이브, 디지털 자산 정리 모두 자유롭게 작성 가능합니다."
      },
      {
        icon: "💌", title: "미래 편지함",
        desc: "편지 내용 작성 후 '공개 날짜'를 설정하세요. 설정 날짜 이전에 열람하려면 설정한 비밀번호를 입력해야 합니다. 날짜가 지나면 자유롭게 열람 가능합니다."
      },
    ]
  },
  coop: {
    title: "Co-op Sync 가이드",
    sections: [
      {
        icon: "🔄", title: "목표 동기화",
        desc: "SYNC 버튼을 눌러 나와 파트너의 목표 현황을 서버와 동기화합니다."
      },
      {
        icon: "💑", title: "파트너 연결",
        desc: "파트너의 티어·달성률이 실시간으로 표시됩니다. 서로의 목표를 보며 함께 성장하세요."
      },
      {
        icon: "📅", title: "기념일 카운터",
        desc: "함께한 날과 다음 기념일까지 남은 날을 자동으로 계산합니다."
      },
    ]
  },
};

export default function GuidePanel({ page, onClose }) {
  const guide = GUIDES[page] ?? GUIDES.home;
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 480, boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>❓</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{guide.title}</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>

        {/* 탭 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {guide.sections.map((s, i) => (
            <button key={i} onClick={() => setActiveIdx(i)} style={{
              flex: 1, padding: "7px 4px", border: "none", borderRadius: 8, cursor: "pointer",
              fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600,
              background: activeIdx === i ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.04)",
              color: activeIdx === i ? "#c084fc" : "#64748b",
              transition: "all 0.15s",
            }}>
              {s.icon}
            </button>
          ))}
        </div>

        {/* 내용 */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 15, marginBottom: 10 }}>{guide.sections[activeIdx].icon} <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{guide.sections[activeIdx].title}</span></div>
          <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.8 }}>{guide.sections[activeIdx].desc}</div>
        </div>

        <div style={{ marginTop: 16, fontSize: 11, color: "#475569", textAlign: "center", fontFamily: "var(--mono)" }}>
          탭을 눌러 다른 기능 가이드를 확인하세요
        </div>
      </div>
    </div>
  );
}
