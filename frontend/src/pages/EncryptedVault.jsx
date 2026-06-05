import React, { useState, useEffect } from "react";
import { api } from "../utils/api";

const ITEM_STYLES = [
  { color: "linear-gradient(90deg,#a855f7,#7c3aed)", bg: "rgba(168,85,247,0.12)", accent: "#a855f7" },
  { color: "linear-gradient(90deg,#ec4899,#db2777)", bg: "rgba(236,72,153,0.12)", accent: "#ec4899" },
  { color: "linear-gradient(90deg,#06b6d4,#0891b2)", bg: "rgba(6,182,212,0.12)", accent: "#06b6d4" },
  { color: "linear-gradient(90deg,#10b981,#059669)", bg: "rgba(16,185,129,0.12)", accent: "#10b981" },
];

const LETTER_ITEM_ID = "vault_3"; // 미래 편지함

export default function EncryptedVault({ vaultItems, setVaultItems }) {
  const [vaultState, setVaultState] = useState("locked");
  const [activeNote, setActiveNote] = useState(null); // { itemId, mode: "view"|"edit"|"letter_lock"|"letter_setup" }
  const [noteContent, setNoteContent] = useState("");
  const [notes, setNotes] = useState({}); // { [itemId]: noteData }
  const [editProgress, setEditProgress] = useState(0);
  const [editProgressId, setEditProgressId] = useState(null);
  const [error, setError] = useState(null);

  // 미래 편지함 설정 상태
  const [letterDate, setLetterDate] = useState("");
  const [letterPassword, setLetterPassword] = useState("");
  const [letterPwVerify, setLetterPwVerify] = useState("");
  const [letterUnlockPw, setLetterUnlockPw] = useState("");

  const unlock = async () => {
    setVaultState("scanning");
    try { await api.unlockVault(); } catch {}
    setTimeout(() => setVaultState("unlocked"), 2000);
  };

  const loadNote = async (itemId) => {
    if (notes[itemId]) return notes[itemId];
    try {
      const note = await api.getVaultNote(itemId);
      setNotes(p => ({ ...p, [itemId]: note }));
      return note;
    } catch { return null; }
  };

  const openItem = async (item, idx) => {
    const note = await loadNote(item.id);
    if (item.id === LETTER_ITEM_ID) {
      const hasLock = note?.unlock_date && new Date(note.unlock_date) > new Date();
      if (hasLock) {
        setActiveNote({ itemId: item.id, mode: "letter_lock", note });
      } else {
        setNoteContent(note?.content ?? "");
        setLetterDate(note?.unlock_date?.slice(0, 10) ?? "");
        setActiveNote({ itemId: item.id, mode: note?.unlock_date ? "view" : "letter_setup", note });
      }
    } else {
      setNoteContent(note?.content ?? "");
      setActiveNote({ itemId: item.id, mode: "edit", note });
    }
  };

  const saveNote = async () => {
    try {
      const updated = await api.saveVaultNote(activeNote.itemId, { content: noteContent });
      setNotes(p => ({ ...p, [activeNote.itemId]: updated }));
      setActiveNote(null);
      setError(null);
    } catch (err) { setError(err.message); }
  };

  const saveLetterSetup = async () => {
    if (letterPassword && letterPassword !== letterPwVerify) {
      setError("비밀번호가 일치하지 않습니다"); return;
    }
    try {
      const body = { content: noteContent, unlockDate: letterDate || null };
      if (letterPassword) body.letterPassword = letterPassword;
      const updated = await api.saveVaultNote(LETTER_ITEM_ID, body);
      setNotes(p => ({ ...p, [LETTER_ITEM_ID]: updated }));
      setActiveNote(null); setLetterPassword(""); setLetterPwVerify(""); setError(null);
    } catch (err) { setError(err.message); }
  };

  const verifyLetterPw = async () => {
    try {
      const result = await api.verifyLetterPassword(LETTER_ITEM_ID, letterUnlockPw);
      if (result.access) {
        setNoteContent(result.content ?? "");
        setLetterDate(result.unlock_date?.slice(0, 10) ?? "");
        setActiveNote(p => ({ ...p, mode: "letter_edit_unlocked" }));
        setLetterUnlockPw(""); setError(null);
      }
    } catch (err) { setError(err.message); }
  };

  const saveLetterAfterUnlock = async () => {
    try {
      const body = { content: noteContent, unlockDate: letterDate || null };
      if (letterPassword) body.letterPassword = letterPassword;
      const updated = await api.saveVaultNote(LETTER_ITEM_ID, body);
      setNotes(p => ({ ...p, [LETTER_ITEM_ID]: updated }));
      setActiveNote(null); setLetterPassword(""); setError(null);
    } catch (err) { setError(err.message); }
  };

  const saveProgress = async (id) => {
    try {
      const updated = await api.patchVaultItem(id, { progress: editProgress });
      setVaultItems(prev => prev.map(v => v.id === id ? { ...v, progress: updated.progress } : v));
      setEditProgressId(null); setError(null);
    } catch (err) { setError(err.message); }
  };

  if (vaultState === "locked") return (
    <div className="card">
      <div className="vault-lock">
        <div className="vault-lock-icon">🔒</div>
        <div className="vault-lock-title">ENCRYPTED VAULT</div>
        <div className="vault-lock-sub">생체 인증이 필요합니다 · BIOMETRIC REQUIRED</div>
        <button className="btn-unlock" onClick={unlock}>🔓 UNLOCK — 보안 해제</button>
      </div>
    </div>
  );

  if (vaultState === "scanning") return (
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
    <>
      <div className="card" style={{ animation: "fadeIn 0.5s ease" }}>
        <div className="card-title"><span className="card-title-icon">🔓</span>디지털 유언장 &amp; 웰다잉 아카이브</div>
        <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "8px 14px", marginBottom: 16, fontSize: 11, fontFamily: "var(--mono)", color: "var(--g)" }}>
          ✓ 인증 완료 · {new Date().toLocaleTimeString("ko-KR")} · 세션 만료: 30분 후
        </div>

        {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 11, color: "#ef4444", fontFamily: "var(--mono)" }}>⚠ {error}</div>}

        {vaultItems.map((item, i) => {
          const style = ITEM_STYLES[i % ITEM_STYLES.length];
          const note = notes[item.id];
          const isEditing = editProgressId === item.id;
          const hasContent = note?.content && note.content.trim().length > 0;
          const isLetter = item.id === LETTER_ITEM_ID;
          const letterLocked = isLetter && note?.unlock_date && new Date(note.unlock_date) > new Date();

          return (
            <div className="vault-item" key={item.id} style={{ animationDelay: `${i * 0.1}s`, animation: "fadeIn 0.4s ease both" }}>
              <div className="vault-item-header">
                <div className="vault-item-icon" style={{ background: style.bg }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div className="vault-item-label">{item.label}</div>
                  {hasContent && <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>✍ 내용 작성됨</div>}
                  {isLetter && note?.unlock_date && (
                    <div style={{ fontSize: 10, color: letterLocked ? "#f97316" : "var(--g)", marginTop: 2 }}>
                      {letterLocked ? `🔒 ${new Date(note.unlock_date).toLocaleDateString("ko-KR")} 이전 잠금` : `📅 ${new Date(note.unlock_date).toLocaleDateString("ko-KR")} 공개`}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isEditing ? (
                    <>
                      <input type="number" min="0" max="100" value={editProgress} onChange={e => setEditProgress(Number(e.target.value))}
                        style={{ width: 52, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, color: "white", fontSize: 12, padding: "2px 6px", fontFamily: "var(--mono)" }} />
                      <button onClick={() => saveProgress(item.id)} style={{ background: "var(--p)", border: "none", borderRadius: 6, color: "white", fontSize: 11, padding: "3px 8px", cursor: "pointer" }}>저장</button>
                      <button onClick={() => setEditProgressId(null)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer" }}>✕</button>
                    </>
                  ) : (
                    <>
                      <div className="vault-item-pct" style={{ background: style.color, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{item.progress}%</div>
                      <button onClick={() => { setEditProgressId(item.id); setEditProgress(item.progress); }}
                        style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }} title="진행률 수정">✎</button>
                    </>
                  )}
                  <button
                    onClick={() => openItem(item, i)}
                    style={{ background: `${style.accent}22`, border: `1px solid ${style.accent}44`, borderRadius: 7, color: style.accent, fontSize: 11, padding: "4px 10px", cursor: "pointer", fontWeight: 600 }}
                  >
                    {isLetter ? (letterLocked ? "🔒 열기" : "💌 작성") : "📝 작성"}
                  </button>
                </div>
              </div>
              <div className="vault-item-bar">
                <div className="vault-item-fill" style={{ width: `${item.progress}%`, background: style.color }} />
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(236,72,153,0.07)", border: "1px solid rgba(236,72,153,0.2)", borderRadius: 10, fontSize: 11, color: "#94a3b8" }}>
          💡 <span style={{ color: "var(--pk)" }}>웰다잉 TIP</span> — 오늘 미래 편지함에 1개 메시지를 남겨보세요.
        </div>
      </div>

      {/* 노트 에디터 모달 */}
      {activeNote && (
        <div style={{ position: "fixed", inset: 0, zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          onClick={e => e.target === e.currentTarget && setActiveNote(null)}>
          <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 520, maxHeight: "85vh", overflow: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
            {/* 헤더 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
                {vaultItems.find(v => v.id === activeNote.itemId)?.icon}{" "}
                {vaultItems.find(v => v.id === activeNote.itemId)?.label}
              </div>
              <button onClick={() => { setActiveNote(null); setError(null); }} style={{ background: "none", border: "none", color: "#64748b", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>

            {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "#ef4444" }}>⚠ {error}</div>}

            {/* 일반 노트 편집 */}
            {(activeNote.mode === "edit") && (
              <>
                <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)}
                  placeholder="내용을 자유롭게 작성하세요..."
                  style={{ ...textareaStyle, height: 220 }} />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                  <button onClick={() => setActiveNote(null)} style={cancelBtn}>취소</button>
                  <button onClick={saveNote} style={saveBtn}>💾 저장</button>
                </div>
              </>
            )}

            {/* 미래 편지함 — 잠금 상태 */}
            {activeNote.mode === "letter_lock" && (
              <>
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>
                    이 편지는 <span style={{ color: "#f97316", fontWeight: 700 }}>{new Date(activeNote.note?.unlock_date).toLocaleDateString("ko-KR")}</span> 이후 공개됩니다
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>비밀번호를 입력하면 미리 열람할 수 있습니다</div>
                  <input type="password" value={letterUnlockPw} onChange={e => setLetterUnlockPw(e.target.value)}
                    placeholder="비밀번호 입력" style={{ ...textareaStyle, height: "auto", padding: "10px 14px", marginBottom: 12 }}
                    onKeyDown={e => e.key === "Enter" && verifyLetterPw()} />
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    <button onClick={() => setActiveNote(null)} style={cancelBtn}>취소</button>
                    <button onClick={verifyLetterPw} style={saveBtn}>🔓 열람하기</button>
                  </div>
                </div>
              </>
            )}

            {/* 미래 편지함 — 날짜·비밀번호 설정 (최초) */}
            {activeNote.mode === "letter_setup" && (
              <>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14, lineHeight: 1.6 }}>
                  💌 미래의 나에게 편지를 남겨보세요. 공개 날짜를 설정하면 그 날까지 비밀번호로 보호됩니다.
                </div>
                <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)}
                  placeholder="미래의 나에게 전하고 싶은 말을 써보세요..."
                  style={{ ...textareaStyle, height: 160 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                  <div>
                    <label style={labelStyle}>공개 날짜</label>
                    <input type="date" value={letterDate} onChange={e => setLetterDate(e.target.value)} style={{ ...textareaStyle, height: "auto", padding: "8px 12px" }} />
                  </div>
                  <div>
                    <label style={labelStyle}>비밀번호 (선택)</label>
                    <input type="password" value={letterPassword} onChange={e => setLetterPassword(e.target.value)} placeholder="조기 열람 비밀번호" style={{ ...textareaStyle, height: "auto", padding: "8px 12px" }} />
                  </div>
                </div>
                {letterPassword && (
                  <div style={{ marginTop: 10 }}>
                    <label style={labelStyle}>비밀번호 확인</label>
                    <input type="password" value={letterPwVerify} onChange={e => setLetterPwVerify(e.target.value)} placeholder="비밀번호 재입력" style={{ ...textareaStyle, height: "auto", padding: "8px 12px" }} />
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
                  <button onClick={() => setActiveNote(null)} style={cancelBtn}>취소</button>
                  <button onClick={saveLetterSetup} style={saveBtn}>💌 저장</button>
                </div>
              </>
            )}

            {/* 미래 편지함 — 비밀번호 해제 후 편집 */}
            {activeNote.mode === "letter_edit_unlocked" && (
              <>
                <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 11, color: "var(--g)", fontFamily: "var(--mono)" }}>
                  ✓ 인증 성공 — 편지를 열람·수정할 수 있습니다
                </div>
                <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)}
                  placeholder="미래의 나에게 전하고 싶은 말을 써보세요..."
                  style={{ ...textareaStyle, height: 160 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                  <div>
                    <label style={labelStyle}>공개 날짜 수정</label>
                    <input type="date" value={letterDate} onChange={e => setLetterDate(e.target.value)} style={{ ...textareaStyle, height: "auto", padding: "8px 12px" }} />
                  </div>
                  <div>
                    <label style={labelStyle}>새 비밀번호 (선택)</label>
                    <input type="password" value={letterPassword} onChange={e => setLetterPassword(e.target.value)} placeholder="변경 시 입력" style={{ ...textareaStyle, height: "auto", padding: "8px 12px" }} />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
                  <button onClick={() => setActiveNote(null)} style={cancelBtn}>취소</button>
                  <button onClick={saveLetterAfterUnlock} style={saveBtn}>💾 저장</button>
                </div>
              </>
            )}

            {/* 미래 편지함 — 날짜 지났을 때 열람/수정 */}
            {activeNote.mode === "view" && (
              <>
                <div style={{ background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 11, color: "var(--c)", fontFamily: "var(--mono)" }}>
                  📬 공개 날짜가 됐습니다 — 편지를 열람할 수 있습니다
                </div>
                <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)}
                  placeholder="미래의 나에게 전하고 싶은 말을 써보세요..."
                  style={{ ...textareaStyle, height: 160 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                  <div>
                    <label style={labelStyle}>공개 날짜 수정</label>
                    <input type="date" value={letterDate} onChange={e => setLetterDate(e.target.value)} style={{ ...textareaStyle, height: "auto", padding: "8px 12px" }} />
                  </div>
                  <div>
                    <label style={labelStyle}>새 비밀번호 (선택)</label>
                    <input type="password" value={letterPassword} onChange={e => setLetterPassword(e.target.value)} placeholder="변경 시 입력" style={{ ...textareaStyle, height: "auto", padding: "8px 12px" }} />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
                  <button onClick={() => setActiveNote(null)} style={cancelBtn}>취소</button>
                  <button onClick={saveLetterAfterUnlock} style={saveBtn}>💾 저장</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const textareaStyle = {
  width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#e2e8f0",
  fontSize: 13, padding: "12px 14px", resize: "vertical", outline: "none",
  fontFamily: "var(--sans)", lineHeight: 1.7,
};
const labelStyle = { fontSize: 10, color: "#64748b", fontFamily: "var(--mono)", letterSpacing: 1, display: "block", marginBottom: 6, textTransform: "uppercase" };
const cancelBtn = { padding: "8px 16px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, background: "transparent", color: "#64748b", fontSize: 12, cursor: "pointer" };
const saveBtn = { padding: "8px 20px", border: "none", borderRadius: 9, background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" };
