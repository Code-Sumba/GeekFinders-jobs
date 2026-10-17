import { createHmac, timingSafeEqual } from "node:crypto";

/** Signed, login-free unsubscribe links for email digests (no guessable user ids). */
const secret = () => process.env.UNSUBSCRIBE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function unsubscribeToken(userId: string) {
  return createHmac("sha256", secret()).update(`unsub:${userId}`).digest("base64url").slice(0, 32);
}

export function verifyUnsubscribe(userId: string, token: string) {
  if (!secret() || !userId || !token) return false;
  const a = Buffer.from(unsubscribeToken(userId));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function unsubscribeUrl(appUrl: string, userId: string) {
  return `${appUrl}/unsubscribe?u=${encodeURIComponent(userId)}&t=${unsubscribeToken(userId)}`;
}
