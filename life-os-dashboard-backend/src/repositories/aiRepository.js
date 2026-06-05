import { db } from "../db/connection.js";

function toAdvice(row) {
  if (!row) return null;
  return {
    topic: row.topic,
    body: row.body,
    mode: row.is_static ? "static" : "generated",
    updatedAt: row.updated_at,
  };
}

export function listTopics() {
  return db.prepare("SELECT topic FROM ai_advice ORDER BY topic ASC").all();
}

export function getAdvice(topic) {
  return toAdvice(db.prepare("SELECT * FROM ai_advice WHERE topic = ?").get(topic));
}
