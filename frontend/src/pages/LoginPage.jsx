import React, { useState } from "react";
import { api, saveToken } from "../utils/api";

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "", displayName: "", avatar: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = mode === "login"
        ? await api.login({ username: form.username, password: form.password })
        : await api.register({ username: form.username, password: form.password, displayName: form.displayName, avatar: form.avatar });
      saveToken(data.token);
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0d0d1a", fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
    }}>
      {/* 배경 글로우 */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "15%", left: "10%", width: 500, height: 500, borderRadius: "50%", background: "rgba(168,85,247,0.08)", filter: "blur(100px)" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "8%", width: 400, height: 400, borderRadius: "50%", background: "rgba(6,182,212,0.07)", filter: "blur(80px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420, padding: "0 20px" }}>
        {/* 로고 */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>⚡</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9", letterSpacing: 3 }}>Life OS</div>
          <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono', monospace", marginTop: 6, letterSpacing: 2 }}>v2.0 · BETA · 인생 운영체제</div>
        </div>

        {/* 카드 */}
        <div style={{
          background: "#13131f",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: 32,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}>
          {/* 모드 탭 */}
          <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 4 }}>
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                style={{
                  flex: 1, padding: "9px 0", border: "none", borderRadius: 9, cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: 1,
                  background: mode === m ? "rgba(168,85,247,0.22)" : "transparent",
                  color: mode === m ? "#c084fc" : "#64748b",
                  transition: "all 0.2s",
                }}
              >
                {m === "login" ? "🔐 로그인" : "✨ 회원가입"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "register" && (
              <>
                <Field label="이름 (표시명)">
                  <input type="text" value={form.displayName} onChange={set("displayName")}
                    placeholder="이름을 입력하시오" style={inputStyle} required />
                </Field>
                <Field label="아바타 (2자, 선택)">
                  <input type="text" value={form.avatar} onChange={set("avatar")}
                    placeholder="닉네임을 입력하시오" maxLength={2} style={inputStyle} />
                </Field>
              </>
            )}

            <Field label="아이디">
              <input type="text" value={form.username} onChange={set("username")}
                placeholder="아이디를 입력하시오" style={inputStyle}
                required autoFocus={mode === "login"} />
            </Field>

            <Field label="비밀번호">
              <input type="password" value={form.password} onChange={set("password")}
                placeholder="비밀번호를 입력하시오" style={inputStyle} required />
            </Field>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)",
                borderRadius: 9, padding: "10px 14px", fontSize: 12, color: "#f87171",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4, padding: "13px 0", border: "none", borderRadius: 12,
                background: loading ? "rgba(168,85,247,0.3)" : "linear-gradient(135deg,#a855f7,#7c3aed)",
                color: "#fff", fontWeight: 800, fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 20px rgba(168,85,247,0.35)",
                transition: "all 0.2s",
              }}
            >
              {loading ? "⚡ 처리 중..." : mode === "login" ? "🔓 로그인" : "✨ 계정 생성"}
            </button>
          </form>

          {mode === "login" && (
            <div style={{
              marginTop: 18, padding: "11px 14px",
              background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 10, fontSize: 12, color: "#94a3b8",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              💡 기본 계정: <span style={{ color: "#a78bfa", fontWeight: 700 }}>whale</span>
              {" / "}
              <span style={{ color: "#a78bfa", fontWeight: 700 }}>1234</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{
        fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: 1, display: "block", marginBottom: 7, textTransform: "uppercase",
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "11px 15px", boxSizing: "border-box",
  background: "#0d0d1a",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  color: "#f1f5f9",
  fontSize: 14,
  fontFamily: "'JetBrains Mono', monospace",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  caretColor: "#a855f7",
};
