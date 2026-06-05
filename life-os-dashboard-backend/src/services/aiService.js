import { getAdvice, listTopics } from "../repositories/aiRepository.js";
import { httpError } from "../utils/httpError.js";
import { requireText } from "./validation.js";

export function readTopics() {
  return listTopics();
}

export function createAdvice(payload) {
  const topic = requireText(payload.topic, "topic");
  const advice = getAdvice(topic);
  if (!advice) {
    throw httpError(404, "NOT_FOUND", "AI advice topic not found");
  }
  return advice;
}
