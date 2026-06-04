import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

import { ROLES } from '@frms/shared'

import { env, isProd } from '../config/env.ts'
import { db } from '../db/client.ts'
import * as schema from '../db/schema.ts'

// Cookie security follows the URL scheme, not NODE_ENV.
// Browsers reject `__Secure-` prefixed cookies that don't arrive over HTTPS, so
// running the API behind plain HTTP (typical for local docker dev) MUST send
// non-secure cookies — otherwise the session_token never persists in the
// browser, getSession returns null on the next request, and the client bounces
// back to /login after a successful sign-in.
const isHttps = env.betterAuthUrl.startsWith('https://')

export const auth = betterAuth({
  appName: 'Faculty Material Resources Management',
  baseURL: env.betterAuthUrl,
  secret: env.betterAuthSecret,
  trustedOrigins: env.trustedOrigins,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Email verification is intentionally disabled in this academic scope — the seed
    // accounts and the supplier self-registration flow rely on immediate sign-in.
    requireEmailVerification: false,
  },
  socialProviders: {
    ...(env.github.clientId && env.github.clientSecret
      ? {
          github: {
            clientId: env.github.clientId,
            clientSecret: env.github.clientSecret,
          },
        }
      : {}),
    ...(env.google.clientId && env.google.clientSecret
      ? {
          google: {
            clientId: env.google.clientId,
            clientSecret: env.google.clientSecret,
          },
        }
      : {}),
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once per day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  // Built-in rate limiter. Defaults: 60s window, 100 reqs per IP; stricter defaults
  // already applied internally to /sign-in/* and /forget-password.
  rateLimit: {
    enabled: true,
    window: 60,
    max: isProd ? 100 : 1000,
  },
  advanced: {
    // CSRF + origin checks stay enabled (defaults). trustedOrigins above gates them.
    useSecureCookies: isHttps,
    cookiePrefix: 'frms',
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isHttps,
    },
    // Reverse-proxy aware client IP detection (nginx, compose, Cloudflare, etc.).
    ipAddress: {
      ipAddressHeaders: ['cf-connecting-ip', 'x-real-ip', 'x-forwarded-for'],
      disableIpTracking: false,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: ROLES.TEACHER,
        // privileged roles can never be self-assigned through public auth flows
        input: false,
      },
      status: {
        type: 'string',
        required: false,
        defaultValue: 'ACTIVE',
        input: false,
      },
      departmentId: {
        type: 'string',
        required: false,
        input: false,
      },
      supplierId: {
        type: 'string',
        required: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Server-side guarantee: even if a future plugin tries to set role/status
        // on signup, force the safe defaults. Privileged roles (ADMIN,
        // RESOURCE_MANAGER, DEPARTMENT_HEAD, MAINTENANCE_TECHNICIAN, SUPPLIER)
        // are only assignable by an authenticated admin via /api/users/:id/role
        // or by the supplier-registration flow.
        before: async (newUser) => ({
          data: {
            ...newUser,
            role: ROLES.TEACHER,
            status: 'ACTIVE',
          },
        }),
      },
    },
  },
})

export type Auth = typeof auth
export type SessionUser = typeof auth.$Infer.Session.user
export type SessionInfo = typeof auth.$Infer.Session.session
