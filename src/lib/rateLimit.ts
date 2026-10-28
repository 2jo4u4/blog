/**
 * Lightweight in-memory sliding-window rate limiter for edge workers.
 * Tracks failed attempts per client IP to mitigate automated brute-force attacks.
 */

export interface RateLimitRecord {
  failedCount: number;
  firstFailedAt: number;
}

export class LoginRateLimiter {
  private records = new Map<string, RateLimitRecord>();
  private readonly windowMs: number;
  private readonly maxAttempts: number;

  constructor(windowMs = 15 * 60 * 1000, maxAttempts = 5) {
    this.windowMs = windowMs;
    this.maxAttempts = maxAttempts;
  }

  isBlocked(ip: string, now = Date.now()): boolean {
    const record = this.records.get(ip);
    if (!record) return false;
    if (now - record.firstFailedAt > this.windowMs) {
      this.records.delete(ip);
      return false;
    }
    return record.failedCount >= this.maxAttempts;
  }

  recordFailure(ip: string, now = Date.now()): void {
    const record = this.records.get(ip);
    if (!record || now - record.firstFailedAt > this.windowMs) {
      this.records.set(ip, { failedCount: 1, firstFailedAt: now });
    } else {
      record.failedCount += 1;
    }
  }

  reset(ip: string): void {
    this.records.delete(ip);
  }

  clear(): void {
    this.records.clear();
  }
}
