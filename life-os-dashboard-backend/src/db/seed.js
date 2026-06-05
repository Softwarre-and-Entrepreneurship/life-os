import { randomBytes, scryptSync } from "node:crypto";
import { db, transaction } from "./connection.js";
import { nowIso } from "../utils/time.js";

const KEYLEN = 64;
function hashPassword(password, salt) {
  return scryptSync(password, salt, KEYLEN).toString("hex");
}

const advice = {
  "✨ MVP 전략": `MVP의 본질은 **가장 작은 단위의 가치 증명**입니다.\n\n① 목표 입력 → AI 태스크 분해 → 타임라인 시각화, 이 3단계 루프만 완벽히 작동하면 됩니다. 유언장, 커뮤니티, 소셜 기능은 전부 v2입니다.\n\n② 프롬프트 엔지니어링이 곧 제품 품질입니다. "목표: {goal}, 마감: {date}, 주당 가용시간: {hours}" → JSON 태스크 리스트 반환 형태로 Claude API 연동을 먼저 구현하세요.\n\n③ 사용자 1명이 3번 연속 접속하면 PMF 신호입니다. 기능보다 재방문율을 먼저 측정하세요.`,
  "🏆 피칭 전략": `심사위원이 기억하는 피칭은 **문제→숫자→솔루션→팀** 순서입니다.\n\n① 오프닝: "대학생 78%가 목표를 3주 안에 포기합니다" — 통계로 시작하면 주목도가 3배 올라갑니다.\n\n② 데모는 반드시 라이브로. 슬라이드 캡처 대신 실제 앱에 목표를 입력하고 AI가 로드맵을 생성하는 장면을 보여주세요.\n\n③ 팀 슬라이드는 마지막에. "컴퓨터공학 5인+보안 1인, 모두 실제 구현 경험 보유"라는 문장 하나가 어떤 수상 경력보다 강합니다.`,
  "🎮 게이미피케이션": `지속 가능한 게이미피케이션의 핵심은 **내재적 동기 강화**입니다.\n\n① XP보다 스트릭(연속 달성일)이 강력합니다. Duolingo가 증명했듯, "오늘 끊으면 7일 기록이 사라진다"는 손실 회피 심리가 최고의 리텐션 도구입니다.\n\n② 티어 시스템은 6단계가 최적입니다. Bronze→Silver→Gold→Platinum→Diamond→Mythic. 너무 많으면 천장이 안 보이고, 너무 적으면 성장감이 없습니다.\n\n③ 소셜 압력은 가장 강력한 동기 부여입니다. Co-op 기능에서 파트너의 달성률이 내 화면에 실시간으로 보이는 것만으로도 행동 변화를 이끌어낼 수 있습니다.`,
};

export function seedDatabase() {
  const timestamp = nowIso();

  // 기본 유저 계정 시드 — profiles 유무와 별개로 항상 확인
  const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  if (userCount === 0) {
    const salt = randomBytes(16).toString("hex");
    const passwordHash = hashPassword("1234", salt);
    db.prepare(`
      INSERT OR IGNORE INTO users (id, username, password_hash, salt, display_name, avatar, profile_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run("seed-user-whale", "whale", passwordHash, salt, "김기은", "KE", "local-user", timestamp);
  }

  const profileCount = db.prepare("SELECT COUNT(*) AS count FROM profiles").get().count;
  if (profileCount > 0) return;

  transaction(() => {
    db.prepare(`
      INSERT INTO profiles (id, display_name, avatar, tier, level, xp, xp_target, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run("local-user", "김기은", "KE", "DIAMOND IV", 12, 3600, 5000, timestamp, timestamp);

    const insertBug = db.prepare(`
      INSERT INTO bugs (id, text, severity, status, created_at, resolved_at)
      VALUES (?, ?, ?, 'open', ?, NULL)
    `);
    [
      ["bug_seed_1", "영단어 복습 누락", "high"],
      ["bug_seed_2", "운동 스킵 (3일째)", "critical"],
      ["bug_seed_3", "물 2L 마시기 실패", "low"],
      ["bug_seed_4", "독서 30분 미달성", "med"],
    ].forEach(([id, text, severity]) => insertBug.run(id, text, severity, timestamp));

    const insertGoal = db.prepare(`
      INSERT INTO goals (id, owner_type, label, progress, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    [
      ["goal_self_1", "self", "토익 950", 68],
      ["goal_self_2", "self", "체중 감량", 82],
      ["goal_self_3", "self", "포트폴리오", 45],
      ["goal_partner_1", "partner", "JLPT N2", 77],
      ["goal_partner_2", "partner", "코딩 100일", 91],
      ["goal_partner_3", "partner", "독서 50권", 38],
    ].forEach(([id, ownerType, label, progress]) => insertGoal.run(id, ownerType, label, progress, timestamp, timestamp));

    const insertAdvice = db.prepare(`
      INSERT INTO ai_advice (topic, body, is_static, updated_at)
      VALUES (?, ?, 1, ?)
    `);
    Object.entries(advice).forEach(([topic, body]) => insertAdvice.run(topic, body, timestamp));

    const insertVaultItem = db.prepare(`
      INSERT INTO vault_items (id, label, progress, icon, category, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    [
      ["vault_1", "가치관 선언문", 90, "📜", "values"],
      ["vault_2", "메모리 아카이브", 55, "📸", "memory"],
      ["vault_3", "미래 편지함", 30, "💌", "letter"],
      ["vault_4", "디지털 자산 정리", 15, "🔐", "asset"],
    ].forEach(([id, label, progress, icon, category]) => {
      insertVaultItem.run(id, label, progress, icon, category, timestamp, timestamp);
    });

    db.prepare(`
      INSERT INTO coop_profiles (id, display_name, avatar, tier, anniversary, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run("partner-local", "기은", "SH", "PLATINUM III", "2026-02-14", timestamp);

    const insertRoadmap = db.prepare(`
      INSERT INTO roadmap_items (id, label, date_label, status, progress, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    [
      ["rm_1", "아이템 컨셉 확정", "4월 완료", "done", null, 1],
      ["rm_2", "기술 스택 선정", "5월 초 완료", "done", null, 2],
      ["rm_3", "AI 로드맵 알고리즘 개발", "5월 19일 · 진행 중", "active", 65, 3],
      ["rm_4", "MVP 출시 & 내부 테스트", "6월 25일", "pending", null, 4],
      ["rm_5", "피드백 반영 & 고도화", "7월", "pending", null, 5],
    ].forEach(([id, label, date_label, status, progress, sort_order]) => {
      insertRoadmap.run(id, label, date_label, status, progress, sort_order, timestamp, timestamp);
    });

    const insertNote = db.prepare(`
      INSERT INTO vault_notes (vault_item_id, content, unlock_date, letter_password_hash, letter_salt, updated_at)
      VALUES (?, '', NULL, NULL, NULL, ?)
    `);
    ["vault_1", "vault_2", "vault_3", "vault_4"].forEach(id => insertNote.run(id, timestamp));
  });
}
