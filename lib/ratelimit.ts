import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;

export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  if (!redis) return { ok: true, headers: new Headers() } as const;
  const rl = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`) });
  const res = await rl.limit(key);
  const headers = new Headers({ 'X-RateLimit-Limit': String(limit), 'X-RateLimit-Remaining': String(res.remaining) });
  return { ok: res.success, headers } as const;
}
