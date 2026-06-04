import type { MiddlewareHandler } from 'hono'

import { hasAnyPermission, hasAnyRole, type Permission, type Role } from '@frms/shared'

import { auth } from '../auth/auth.ts'
import { ForbiddenError, UnauthorizedError } from '../shared/errors.ts'
import type { AppEnv } from '../shared/context.ts'

/**
 * Resolves the Better-Auth session and stores `{ user, session }` in the request
 * context. Skips paths handled by Better-Auth itself — those routes manage their
 * own session lookup, and running ours would double the DB roundtrip on every
 * auth call.
 */
export const sessionMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  if (c.req.path.startsWith('/api/auth/')) {
    c.set('user', null)
    c.set('session', null)
    return next()
  }
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) {
    c.set('user', null)
    c.set('session', null)
  } else {
    c.set('user', session.user)
    c.set('session', session.session)
  }
  await next()
}

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const user = c.get('user')
  if (!user) throw UnauthorizedError()
  await next()
}

export function requireRole(...allowed: Role[]): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const user = c.get('user')
    if (!user) throw UnauthorizedError()
    const role = user.role as Role | undefined
    if (!role || !hasAnyRole(role, allowed)) {
      throw ForbiddenError(`Required role: ${allowed.join(' or ')}`)
    }
    await next()
  }
}

export function requirePermission(...permissions: Permission[]): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const user = c.get('user')
    if (!user) throw UnauthorizedError()
    const role = user.role as Role | undefined
    if (!role || !hasAnyPermission(role, permissions)) {
      throw ForbiddenError(`Missing permission: ${permissions.join(' or ')}`)
    }
    await next()
  }
}
