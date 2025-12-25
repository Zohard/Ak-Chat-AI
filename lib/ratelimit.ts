import { Ratelimit } from '@upstash/ratelimit';

/**
 * Rate Limiter Configuration
 *
 * This uses Vercel KV (Redis) to track per-user request limits.
 *
 * To enable rate limiting:
 * 1. Create a Vercel KV database in your Vercel dashboard
 * 2. Add KV_REST_API_URL and KV_REST_API_TOKEN to your .env.local file
 * 3. Uncomment the Redis client initialization below
 *
 * Free tier limits:
 * - Vercel KV: 30,000 commands/month
 * - Upstash: 10,000 commands/day
 */

// Conditional Redis initialization
// Only initialize if KV environment variables are present
let ratelimiter: Ratelimit | null = null;

if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  try {
    const { kv } = require('@vercel/kv');
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '500', 10);

    ratelimiter = new Ratelimit({
      redis: kv,
      // 500 requests per 24 hours per user (1440 minutes)
      limiter: Ratelimit.fixedWindow(maxRequests, '1440 m'),
      prefix: 'anime-ai-chat',
      analytics: true,
    });

    console.log('[Rate Limit] Initialized with max', maxRequests, 'requests/day/user');
  } catch (error) {
    console.warn('[Rate Limit] Failed to initialize:', error);
  }
} else {
  console.warn('[Rate Limit] Disabled - KV environment variables not found');
}

/**
 * Check if a user has exceeded their rate limit
 *
 * @param userId - User identifier (from JWT or session)
 * @returns Object with success status and limit info
 */
export async function checkRateLimit(userId: string) {
  // If rate limiting is not configured, allow all requests
  if (!ratelimiter) {
    return {
      success: true,
      limit: Infinity,
      remaining: Infinity,
      reset: new Date(Date.now() + 86400000), // 24 hours from now
    };
  }

  try {
    const result = await ratelimiter.limit(userId);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: new Date(result.reset),
    };
  } catch (error) {
    console.error('[Rate Limit] Check failed:', error);
    // On error, allow the request but log it
    return {
      success: true,
      limit: -1,
      remaining: -1,
      reset: new Date(),
      error: 'Rate limit check failed',
    };
  }
}

/**
 * Get rate limit headers for HTTP response
 */
export function getRateLimitHeaders(
  limit: number,
  remaining: number,
  reset: Date
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toISOString(),
  };
}
