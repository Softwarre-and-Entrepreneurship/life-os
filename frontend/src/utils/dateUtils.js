export function getDaysFromAnniversary(date) {
  return Math.floor((new Date() - date) / 86400000);
}

export function getDaysToNextAnniversary(date) {
  const now = new Date();
  const next = new Date(date);
  next.setFullYear(now.getFullYear());
  if (next < now) next.setFullYear(now.getFullYear() + 1);
  return Math.ceil((next - now) / 86400000);
}