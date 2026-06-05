import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { transaction } from "../db/connection.js";
import { db } from "../db/connection.js";
import { createSession, deleteSession, getSession } from "../repositories/sessionRepository.js";
import { createUser, getUserById, getUserByUsername, usernameExists } from "../repositories/userRepository.js";
import { getProfile } from "../repositories/profileRepository.js";
import { nowIso } from "../utils/time.js";
import { httpError } from "../utils/httpError.js";

const KEYLEN = 64;

function hashPassword(password, salt) {
  return scryptSync(password, salt, KEYLEN).toString("hex");
}

function verifyPassword(password, salt, hash) {
  const derived = scryptSync(password, salt, KEYLEN);
  const stored = Buffer.from(hash, "hex");
  if (derived.length !== stored.length) return false;
  return timingSafeEqual(derived, stored);
}

function buildResponse(user, token) {
  const profile = getProfile(user.profile_id);
  return {
    token,
    user: { id: user.id, username: user.username, display_name: user.display_name, avatar: user.avatar },
    profile,
  };
}

export function register({ username, password, displayName, avatar }) {
  if (!username || username.trim().length < 2) throw httpError(400, "INVALID_INPUT", "username은 2자 이상이어야 합니다");
  if (!password || password.length < 4) throw httpError(400, "INVALID_INPUT", "password는 4자 이상이어야 합니다");
  if (!displayName || !displayName.trim()) throw httpError(400, "INVALID_INPUT", "이름을 입력해주세요");
  if (usernameExists(username.trim())) throw httpError(409, "CONFLICT", "이미 사용 중인 아이디입니다");

  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);
  const av = (avatar || displayName.trim().slice(0, 2)).toUpperCase();
  const trimmedName = displayName.trim();
  const trimmedUsername = username.trim();

  return transaction(() => {
    // 신규 유저 전용 임시 ID로 profile 먼저 생성
    const profileId = `prof_${Date.now().toString(36)}_${randomBytes(4).toString("hex")}`;
    const now = nowIso();
    db.prepare(`
      INSERT INTO profiles (id, display_name, avatar, tier, level, xp, xp_target, created_at, updated_at)
      VALUES (?, ?, ?, 'BRONZE I', 1, 0, 5000, ?, ?)
    `).run(profileId, trimmedName, av, now, now);

    const user = createUser({
      username: trimmedUsername,
      passwordHash,
      salt,
      displayName: trimmedName,
      avatar: av,
      profileId,
    });

    const token = createSession(user.id);
    return buildResponse(user, token);
  });
}

export function login({ username, password }) {
  if (!username || !password) throw httpError(400, "INVALID_INPUT", "아이디와 비밀번호를 입력해주세요");

  const row = getUserByUsername(username.trim());
  if (!row) throw httpError(401, "UNAUTHORIZED", "아이디 또는 비밀번호가 올바르지 않습니다");

  if (!verifyPassword(password, row.salt, row.password_hash)) {
    throw httpError(401, "UNAUTHORIZED", "아이디 또는 비밀번호가 올바르지 않습니다");
  }

  const token = createSession(row.id);
  return buildResponse(row, token);
}

export function logout(token) {
  deleteSession(token);
  return { ok: true };
}

export function getMe(token) {
  const session = getSession(token);
  if (!session || new Date(session.expires_at) < new Date()) throw httpError(401, "UNAUTHORIZED", "세션이 만료되었습니다");
  const user = getUserById(session.user_id);
  if (!user) throw httpError(401, "UNAUTHORIZED", "사용자를 찾을 수 없습니다");
  return buildResponse(user, token);
}
