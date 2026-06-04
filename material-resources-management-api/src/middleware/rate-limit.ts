import type { Context, MiddlewareHandler } from 'hono'

import { TooManyRequestsError } from '../shared/errors.ts'
import type { AppEnv } from '../shared/context.ts'

interface BucketState {
  count: number
  resetAt: number
}

export interface RateLimitOptions {
  /** Window length in milliseconds. */
  windowMs: number
  /** Maximum requests permitted per key within the window. */
  max: number
  /** Optional override for how the per-request key is derived. */
  keyer?: (c: Context<AppEnv>) => string
}

function clientIp(c: Context<AppEnv>): string {
  // Mirror the order used by Better-Auth's `advanced.ipAddress.ipAddressHeaders`
  // so the proxy chain is honored consistently across the API surface.
  return (
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-real-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    'anonymous'
  )
}

/**
 * Simple per-process, in-memory token bucket. Suitable for a single-instance
 * deployment (the current docker-compose target). For horizontal scaling,
 * swap the `Map` for a Redis-backed store and namespace keys per route.
 */
export function rateLimit(opts: RateLimitOptions): MiddlewareHandler<AppEnv> {
  const buckets = new Map<string, BucketState>()
  const keyer = opts.keyer ?? clientIp

  return async (c, next) => {
    const key = keyer(c)
    const now = Date.now()
    const state = buckets.get(key)
    if (!state || state.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + opts.windowMs })
      return next()
    }
    if (state.count >= opts.max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((state.resetAt - now) / 1000))
      c.header('Retry-After', String(retryAfterSeconds))
      throw TooManyRequestsError()
    }
    state.count++
    return next()
  }
}
