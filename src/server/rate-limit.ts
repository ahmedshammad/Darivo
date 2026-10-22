import { HttpError } from './errors';
export interface RateLimiter {
  check(key: string, limit: number, windowMs: number): void;
}
export class MemoryRateLimiter implements RateLimiter {
  private buckets = new Map<string, { count: number; reset: number }>();
  check(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    if (this.buckets.size > 10000)
      for (const [k, v] of this.buckets) if (v.reset < now) this.buckets.delete(k);
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.reset <= now) {
      this.buckets.set(key, { count: 1, reset: now + windowMs });
      return;
    }
    if (++bucket.count > limit) throw new HttpError(429, 'rate_limited');
  }
}
const limiter = new MemoryRateLimiter();
export function rateLimit(key: string, limit = 60, windowMs = 60000) {
  limiter.check(key, limit, windowMs);
}
