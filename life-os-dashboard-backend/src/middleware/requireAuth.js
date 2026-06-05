import { getSession } from "../repositories/sessionRepository.js";
import { getUserById } from "../repositories/userRepository.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다" } });
  }
  const token = header.slice(7);
  const session = getSession(token);
  if (!session || new Date(session.expires_at) < new Date()) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "세션이 만료되었습니다. 다시 로그인해주세요" } });
  }
  const user = getUserById(session.user_id);
  if (!user) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "사용자를 찾을 수 없습니다" } });
  }
  req.userId = user.id;
  req.profileId = user.profile_id;
  req.authToken = token;
  next();
}
