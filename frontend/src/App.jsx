import React, { useState, useEffect, useCallback } from "react";
import "./styles/globals.css";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import XpBar from "./components/layout/XpBar";
import AIPanel from "./components/ui/AIPanel";
import GuidePanel from "./components/ui/GuidePanel";

import LoginPage from "./pages/LoginPage";
import CommandCenter from "./pages/CommandCenter";
import BugTracker from "./pages/BugTracker";
import EncryptedVault from "./pages/EncryptedVault";
import CoopSync from "./pages/CoopSync";

import { api, clearToken } from "./utils/api";

export default function App() {
  const [authState, setAuthState] = useState("checking");
  const [currentUser, setCurrentUser] = useState(null);

  const [page, setPage] = useState("home");
  const [loading, setLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [showGuideTip, setShowGuideTip] = useState(false);

  const [profile, setProfile] = useState(null);
  const [bugs, setBugs] = useState([]);
  const [goals, setGoals] = useState({ self: [], partner: [] });
  const [partner, setPartner] = useState(null);
  const [vaultItems, setVaultItems] = useState([]);

  useEffect(() => {
    api.getMe()
      .then((data) => { setCurrentUser(data.user); setAuthState("authenticated"); })
      .catch(() => setAuthState("guest"));
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getDashboard();
      setProfile(data.profile);
      setBugs(data.bugs || []);
      setGoals(data.goals || { self: [], partner: [] });
      setPartner(data.partner);
      setVaultItems(data.vaultItems || []);
    } catch (err) {
      if (err.message.includes("세션") || err.message.includes("로그인")) handleLogout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authState === "authenticated") {
      loadDashboard();
      // 첫 방문 체크
      if (!localStorage.getItem("los_guide_seen")) {
        setTimeout(() => setShowGuideTip(true), 1500);
      }
    }
  }, [authState, loadDashboard]);

  const handleLogin = (data) => {
    setCurrentUser(data.user);
    setProfile(data.profile);
    setAuthState("authenticated");
  };

  const handleLogout = async () => {
    try { await api.logout(); } catch {}
    clearToken();
    setCurrentUser(null); setProfile(null); setBugs([]); setGoals({ self: [], partner: [] });
    setPartner(null); setVaultItems([]); setAuthState("guest"); setPage("home");
  };

  const dismissGuideTip = () => {
    setShowGuideTip(false);
    localStorage.setItem("los_guide_seen", "1");
  };

  const openGuide = () => {
    setGuideOpen(true);
    dismissGuideTip();
  };

  if (authState === "checking") {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d0d1a", color: "#64748b", fontFamily: "var(--mono)", fontSize: 13 }}>⚡ 세션 확인 중...</div>;
  }
  if (authState === "guest") return <LoginPage onLogin={handleLogin} />;
  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 13 }}>⚡ 데이터를 불러오는 중...</div>;

  return (
    <div className="los-root">
      <Sidebar page={page} setPage={setPage} bugsCount={bugs.length} profile={profile} onLogout={handleLogout} />

      <main className="main">
        <XpBar xp={profile?.xp ?? 0} xpTarget={profile?.xp_target ?? 5000} level={profile?.level ?? 1} />

        <div className="page" key={page}>
          <Topbar page={page} onOpenGuide={openGuide} />

          {page === "home" && <CommandCenter profile={profile} goals={goals} setGoals={setGoals} openAI={setAiTopic} />}
          {page === "bugs" && <BugTracker bugs={bugs} setBugs={setBugs} profile={profile} setProfile={setProfile} />}
          {page === "vault" && <EncryptedVault vaultItems={vaultItems} setVaultItems={setVaultItems} />}
          {page === "coop" && <CoopSync partner={partner} goals={goals} setGoals={setGoals} />}
        </div>
      </main>

      {/* 첫 방문 가이드 팁 */}
      {showGuideTip && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 900,
          background: "#1e1b4b", border: "1px solid rgba(168,85,247,0.5)",
          borderRadius: 14, padding: "14px 18px", maxWidth: 280,
          boxShadow: "0 8px 30px rgba(168,85,247,0.25)",
          animation: "fadeIn 0.4s ease",
        }}>
          <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600, marginBottom: 6 }}>
            👋 처음이신가요?
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, marginBottom: 12 }}>
            오른쪽 상단의 <span style={{ color: "#c084fc", fontWeight: 700 }}>? 버튼</span>을 누르면 각 기능 사용법 가이드를 확인할 수 있습니다.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={openGuide} style={{ flex: 1, padding: "7px 0", border: "none", borderRadius: 8, background: "rgba(168,85,247,0.3)", color: "#c084fc", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              가이드 보기
            </button>
            <button onClick={dismissGuideTip} style={{ padding: "7px 12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, background: "transparent", color: "#64748b", fontSize: 12, cursor: "pointer" }}>
              닫기
            </button>
          </div>
        </div>
      )}

      {aiTopic && <AIPanel topic={aiTopic} onClose={() => setAiTopic(null)} />}
      {guideOpen && <GuidePanel page={page} onClose={() => setGuideOpen(false)} />}
    </div>
  );
}
