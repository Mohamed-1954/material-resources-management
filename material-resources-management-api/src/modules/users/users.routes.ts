import { Hono } from 'hono'
import { eq } from 'drizzle-orm'

import { ALL_ROLES, PERMISSIONS, ROLES, type Role } from '@frms/shared'
import {
  UserCreateSchema,
  UserRoleUpdateSchema,
  UserStatusUpdateSchema,
  UserUpdateSchema,
} from '@frms/shared'

import { auth } from '../../auth/auth.ts'
import { db } from '../../db/client.ts'
import { user as userTable } from '../../db/schema.ts'
import { requireAuth, requirePermission } from '../../middleware/auth.ts'
import { recordAudit } from '../../shared/audit.ts'
import { ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors.ts'
import { parseOrThrow } from '../../shared/validate.ts'
import type { AppEnv } from '../../shared/context.ts'

export const usersRouter = new Hono<AppEnv>()

usersRouter.use('*', requireAuth)

usersRouter.get('/', requirePermission(PERMISSIONS.USER_MANAGE), async (c) => {
  const rows = await db.select().from(userTable)
  return c.json({ data: rows })
})

usersRouter.get('/me', async (c) => {
  const me = c.get('user')
  if (!me) throw NotFoundError('User')
  return c.json({ data: me })
})

usersRouter.get('/roles', async (c) => {
  return c.json({ data: ALL_ROLES })
})

usersRouter.get('/:id', requirePermission(PERMISSIONS.USER_MANAGE), async (c) => {
  const id = c.req.param('id')
  const [row] = await db.select().from(userTable).where(eq(userTable.id, id))
  if (!row) throw NotFoundError('User')
  return c.json({ data: row })
})

usersRouter.post('/', requirePermission(PERMISSIONS.USER_MANAGE), async (c) => {
  const body = parseOrThrow(UserCreateSchema, await c.req.json())
  const existing = await db.select().from(userTable).where(eq(userTable.email, body.email)).limit(1)
  if (existing.length > 0) throw ConflictError('User with this email already exists')

  // Better-Auth's signUpEmail cannot participate in our tx — run it first,
  // then atomically elevate role/departmentId + audit so a partial failure
  // doesn't leave the new user pinned to the default TEACHER role.
  const created = await auth.api.signUpEmail({
    headers: c.req.raw.headers,
    body: {
      email: body.email,
      password: body.password,
      name: body.name,
    },
  })

  await db.transaction(async (tx) => {
    await tx
      .update(userTable)
      .set({
        role: body.role as Role,
        departmentId: body.departmentId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, created.user.id))

    await recordAudit(
      {
        userId: c.get('user')?.id ?? null,
        action: 'user.create',
        entityType: 'user',
        entityId: created.user.id,
        newValues: { email: body.email, role: body.role, departmentId: body.departmentId ?? null },
      },
      tx,
    )
  })

  return c.json({ data: { id: created.user.id, email: body.email, role: body.role } }, 201)
})

usersRouter.patch('/:id', requirePermission(PERMISSIONS.USER_MANAGE), async (c) => {
  const id = c.req.param('id')
  const body = parseOrThrow(UserUpdateSchema, await c.req.json())
  const [before] = await db.select().from(userTable).where(eq(userTable.id, id))
  if (!before) throw NotFoundError('User')

  await db
    .update(userTable)
    .set({
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.role !== undefined ? { role: body.role } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.departmentId !== undefined ? { departmentId: body.departmentId } : {}),
      updatedAt: new Date(),
    })
    .where(eq(userTable.id, id))

  await recordAudit({
    userId: c.get('user')?.id ?? null,
    action: 'user.update',
    entityType: 'user',
    entityId: id,
    oldValues: before,
    newValues: body,
  })

  const [updated] = await db.select().from(userTable).where(eq(userTable.id, id))
  return c.json({ data: updated })
})

usersRouter.patch('/:id/role', requirePermission(PERMISSIONS.ROLE_ASSIGN), async (c) => {
  const id = c.req.param('id')
  const { role } = parseOrThrow(UserRoleUpdateSchema, await c.req.json())
  if (role === ROLES.ADMIN && (c.get('user') as { role?: Role })?.role !== ROLES.ADMIN) {
    throw ForbiddenError('Only ADMIN can assign ADMIN role')
  }
  const [before] = await db.select().from(userTable).where(eq(userTable.id, id))
  if (!before) throw NotFoundError('User')
  await db.update(userTable).set({ role, updatedAt: new Date() }).where(eq(userTable.id, id))
  await recordAudit({
    userId: c.get('user')?.id ?? null,
    action: 'user.role.change',
    entityType: 'user',
    entityId: id,
    oldValues: { role: before.role },
    newValues: { role },
  })
  return c.json({ data: { id, role } })
})

usersRouter.patch('/:id/status', requirePermission(PERMISSIONS.USER_MANAGE), async (c) => {
  const id = c.req.param('id')
  const { status } = parseOrThrow(UserStatusUpdateSchema, await c.req.json())
  await db.update(userTable).set({ status, updatedAt: new Date() }).where(eq(userTable.id, id))
  await recordAudit({
    userId: c.get('user')?.id ?? null,
    action: 'user.status.change',
    entityType: 'user',
    entityId: id,
    newValues: { status },
  })
  return c.json({ data: { id, status } })
})
