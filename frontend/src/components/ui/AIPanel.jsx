import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { useTyping } from "../../hooks/useTyping";
import RenderBold from "./RenderBold";

export default function AIPanel({ topic, onClose }) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const { displayed, done } = useTyping(body, !loading && !!body);

  useEffect(() => {
    if (!topic) return;
    setBody("");
    setLoading(true);
    api.getAiAdvice(topic)
      .then(data => setBody(data.body ?? ""))
      .catch(() => setBody("AI 응답을 불러오는 데 실패했습니다."))
      .finally(() => setLoading(false));
  }, [topic]);

  return (
    <div className="ai-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ai-panel">
        <div className="ai-panel-header">
          <div className="ai-panel-title">🤖 AI 인생 컨설팅 — {topic}</div>
          <button className="btn-close" onClick={onClose}>✕ 닫기</button>
        </div>
        <div className="ai-typing">
          {loading ? (
            <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12 }}>⚡ 불러오는 중...</span>
          ) : (
            <>
              <RenderBold text={displayed} />
              {!done && <span className="ai-cursor" />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
