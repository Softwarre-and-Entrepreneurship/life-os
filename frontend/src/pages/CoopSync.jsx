import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { getDaysFromAnniversary, getDaysToNextAnniversary } from "../utils/dateUtils";

export default function CoopSync({ partner: partnerProp, goals: goalsProp, setGoals }) {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [syncTime, setSyncTime] = useState(null);
  const [error, setError] = useState(null);

  const [partner, setPartner] = useState(partnerProp);
  const [myGoals, setMyGoals] = useState(goalsProp?.self ?? []);
  const [herGoals, setHerGoals] = useState(goalsProp?.partner ?? []);

  useEffect(() => {
    api.getCoopStatus().then(data => {
      if (data.partner) setPartner(data.partner);
      if (data.goals?.self) setMyGoals(data.goals.self);
      if (data.goals?.partner) setHerGoals(data.goals.partner);
    }).catch(() => {});
  }, []);

  const anniversary = partner?.anniversary ? new Date(partner.anniversary) : null;
  const days = anniversary ? getDaysFromAnniversary(anniversary) : 0;
  const nextAnn = anniversary ? getDaysToNextAnniversary(anniversary) : 0;

  const doSync = async () => {
    setSyncing(true); setSynced(false); setError(null);
    try {
      const result = await api.syncCoop();
      if (result.goals?.self) {
        setMyGoals(result.goals.self);
        setGoals(prev => ({ ...prev, self: result.goals.self }));
      }
      if (result.goals?.partner) {
        setHerGoals(result.goals.partner);
        setGoals(prev => ({ ...prev, partner: result.goals.partner }));
      }
      setSynced(true);
      setSyncTime(new Date().toLocaleTimeString("ko-KR"));
    } catch (err) {
      setError("동기화 실패: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const myAvatar = "KE";
  const partnerAvatar = partner?.avatar ?? "??";
  const partnerName = partner?.display_name ?? "파트너";
  const partnerTier = partner?.tier ?? "";
  const myTier = "DIAMOND";

  return (
    <div>
      <div className="coop-connect">
        <div>
          <div className="coop-avatar" style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", borderColor: "rgba(168,85,247,0.5)", color: "white" }}>{myAvatar}</div>
          <div style={{ fontSize: 11, textAlign: "center", marginTop: 6, fontFamily: "var(--mono)", color: "var(--muted)" }}>나</div>
        </div>
        <div className="coop-link">
          <div className="coop-link-line" />
          <div className="coop-link-label">💑 CONNECTED · {myTier} ↔ {partnerTier.split(" ")[0] || "PLATINUM"}</div>
          <div className="coop-link-line" />
        </div>
        <div>
          <div className="coop-avatar" style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)", borderColor: "rgba(59,130,246,0.5)", color: "white" }}>{partnerAvatar}</div>
          <div style={{ fontSize: 11, textAlign: "center", marginTop: 6, fontFamily: "var(--mono)", color: "var(--muted)" }}>{partnerName}</div>
        </div>
      </div>

      {anniversary && (
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
            <div className="coop-dday-num" style={{ color: "var(--g)" }}>
              {anniversary.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
            </div>
            <div className="coop-dday-label">기념일</div>
          </div>
        </div>
      )}

      <div className="coop-goals">
        <div className="coop-goals-col">
          <h4>나의 목표</h4>
          {myGoals.map((g) => (
            <div className="coop-goal" key={g.id}>
              <div className="coop-goal-label">
                <span>{g.label}</span>
                <span className="coop-goal-pct" style={{ color: "var(--p)" }}>{g.progress}%</span>
              </div>
              <div className="coop-goal-bar">
                <div className="coop-goal-fill" style={{ width: `${g.progress}%`, background: "linear-gradient(90deg,#a855f7,#7c3aed)" }} />
              </div>
            </div>
          ))}
        </div>
        <div className="coop-goals-col">
          <h4>{partnerName}의 목표</h4>
          {herGoals.map((g) => (
            <div className="coop-goal" key={g.id}>
              <div className="coop-goal-label">
                <span>{g.label}</span>
                <span className="coop-goal-pct" style={{ color: "var(--c)" }}>{g.progress}%</span>
              </div>
              <div className="coop-goal-bar">
                <div className="coop-goal-fill" style={{ width: `${g.progress}%`, background: "linear-gradient(90deg,#06b6d4,#0891b2)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "8px 12px", marginBottom: 10, fontSize: 11, color: "#ef4444", fontFamily: "var(--mono)" }}>
          ⚠ {error}
        </div>
      )}

      {synced && (
        <div style={{ textAlign: "center", fontSize: 11, fontFamily: "var(--mono)", color: "var(--g)", marginBottom: 10, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "8px" }}>
          ✓ 동기화 완료 · {syncTime}
        </div>
      )}

      <button className="btn-sync" onClick={doSync} disabled={syncing}>
        {syncing ? <><div className="spinner" /> SYNCING...</> : "🔄 SYNC — 목표 동기화"}
      </button>
    </div>
  );
}
