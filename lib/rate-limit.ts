const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 30 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export type AccessLimitRecord = {
  attempts: number;
  windowStartedAt: number;
  blockedUntil: number | null;
};

export function evaluateAccessLimit(record: AccessLimitRecord | null, now = Date.now()) {
  if (record?.blockedUntil && record.blockedUntil > now) {
    return { blocked: true, attempts: record.attempts, windowStartedAt: record.windowStartedAt, blockedUntil: record.blockedUntil };
  }
  if (!record || now - record.windowStartedAt >= WINDOW_MS) {
    return { blocked: false, attempts: 0, windowStartedAt: now, blockedUntil: null };
  }
  return { blocked: false, attempts: record.attempts, windowStartedAt: record.windowStartedAt, blockedUntil: null };
}

export function recordFailedAccess(record: AccessLimitRecord | null, now = Date.now()) {
  const current = evaluateAccessLimit(record, now);
  if (current.blocked) return current;
  const attempts = current.attempts + 1;
  const blockedUntil = attempts >= MAX_ATTEMPTS ? now + BLOCK_MS : null;
  return { blocked: Boolean(blockedUntil), attempts, windowStartedAt: current.windowStartedAt, blockedUntil };
}

export function retryAfterSeconds(blockedUntil: number | null, now = Date.now()) {
  return Math.max(1, Math.ceil(((blockedUntil || now) - now) / 1000));
}
