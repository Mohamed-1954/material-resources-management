import { Hono } from 'hono'
import { and, eq, sql } from 'drizzle-orm'

import {
  DepartmentCreateSchema,
  DepartmentUpdateSchema,
  DepartmentUserSchema,
  PERMISSIONS,
  ROLES,
} from '@frms/shared'

import { db } from '../../db/client.ts'
import { departmentMembers, departments, user as userTable } from '../../db/schema.ts'
import { requireAuth, requirePermission } from '../../middleware/auth.ts'
import { newId, recordAudit } from '../../shared/audit.ts'
import { ConflictError, NotFoundError } from '../../shared/errors.ts'
import { parseOrThrow } from '../../shared/validate.ts'
import type { AppEnv } from '../../shared/context.ts'

export const departmentsRouter = new Hono<AppEnv>()
departmentsRouter.use('*', requireAuth)

// List enriches each row with the head user's display name + a member count
// so the UI never has to render raw user-ids. Counts are computed by a
// correlated subquery — fine at this cardinality (departments are O(10s)).
departmentsRouter.get('/', async (c) => {
  const rows = await db
    .select({
      id: departments.id,
      name: departments.name,
      code: departments.code,
      headUserId: departments.headUserId,
      headName: userTable.name,
      headEmail: userTable.email,
      memberCount: sql<number>`(
        select count(*)::int from ${departmentMembers}
        where ${departmentMembers.departmentId} = ${departments.id}
      )`,
      createdAt: departments.createdAt,
      updatedAt: departments.updatedAt,
    })
    .from(departments)
    .leftJoin(userTable, eq(userTable.id, departments.headUserId))
  return c.json({ data: rows })
})

departmentsRouter.get('/:id', async (c) => {
  const id = c.req.param('id')
  const [row] = await db
    .select({
      id: departments.id,
      name: departments.name,
      code: departments.code,
      headUserId: departments.headUserId,
      headName: userTable.name,
      headEmail: userTable.email,
      memberCount: sql<number>`(
        select count(*)::int from ${departmentMembers}
        where ${departmentMembers.departmentId} = ${departments.id}
      )`,
      createdAt: departments.createdAt,
      updatedAt: departments.updatedAt,
    })
    .from(departments)
    .leftJoin(userTable, eq(userTable.id, departments.headUserId))
    .where(eq(departments.id, id))
  if (!row) throw NotFoundError('Department')
  return c.json({ data: row })
})

departmentsRouter.post('/', requirePermission(PERMISSIONS.DEPARTMENT_MANAGE), async (c) => {
  const body = parseOrThrow(DepartmentCreateSchema, await c.req.json())
  const dup = await db.select().from(departments).where(eq(departments.code, body.code)).limit(1)
  if (dup.length > 0) throw ConflictError('Department code already exists')
  const id = newId()
  await db.insert(departments).values({ id, name: body.name, code: body.code })
  await recordAudit({
    userId: c.get('user')?.id ?? null,
    action: 'department.create',
    entityType: 'department',
    entityId: id,
    newValues: body,
  })
  return c.json({ data: { id, ...body } }, 201)
})

departmentsRouter.patch('/:id', requirePermission(PERMISSIONS.DEPARTMENT_MANAGE), async (c) => {
  const id = c.req.param('id')
  const body = parseOrThrow(DepartmentUpdateSchema, await c.req.json())
  const [before] = await db.select().from(departments).where(eq(departments.id, id))
  if (!before) throw NotFoundError('Department')
  await db
    .update(departments)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(departments.id, id))
  await recordAudit({
    userId: c.get('user')?.id ?? null,
    action: 'department.update',
    entityType: 'department',
    entityId: id,
    oldValues: before,
    newValues: body,
  })
  return c.json({ data: { id } })
})

departmentsRouter.delete('/:id', requirePermission(PERMISSIONS.DEPARTMENT_MANAGE), async (c) => {
  const id = c.req.param('id')
  await db.delete(departments).where(eq(departments.id, id))
  await recordAudit({
    userId: c.get('user')?.id ?? null,
    action: 'department.delete',
    entityType: 'department',
    entityId: id,
  })
  return c.json({ data: { id } })
})

departmentsRouter.get('/:id/members', async (c) => {
  const id = c.req.param('id')
  const rows = await db
    .select({
      userId: departmentMembers.userId,
      role: departmentMembers.role,
      addedAt: departmentMembers.addedAt,
      email: userTable.email,
      name: userTable.name,
      userRole: userTable.role,
    })
    .from(departmentMembers)
    .innerJoin(userTable, eq(userTable.id, departmentMembers.userId))
    .where(eq(departmentMembers.departmentId, id))
  return c.json({ data: rows })
})

departmentsRouter.post('/:id/members', requirePermission(PERMISSIONS.DEPARTMENT_MANAGE), async (c) => {
  const id = c.req.param('id')
  const { userId } = parseOrThrow(DepartmentUserSchema, await c.req.json())
  const [u] = await db.select().from(userTable).where(eq(userTable.id, userId))
  if (!u) throw NotFoundError('User')
  await db.insert(departmentMembers).values({ departmentId: id, userId, role: 'MEMBER' }).onConflictDoNothing()
  await db.update(userTable).set({ departmentId: id }).where(eq(userTable.id, userId))
  await recordAudit({
    userId: c.get('user')?.id ?? null,
    action: 'department.member.add',
    entityType: 'department',
    entityId: id,
    newValues: { userId },
  })
  return c.json({ data: { departmentId: id, userId } }, 201)
})

departmentsRouter.delete(
  '/:id/members/:userId',
  requirePermission(PERMISSIONS.DEPARTMENT_MANAGE),
  async (c) => {
    const id = c.req.param('id')
    const userId = c.req.param('userId')
    await db
      .delete(departmentMembers)
      .where(and(eq(departmentMembers.departmentId, id), eq(departmentMembers.userId, userId)))
    await db.update(userTable).set({ departmentId: null }).where(eq(userTable.id, userId))
    await recordAudit({
      userId: c.get('user')?.id ?? null,
      action: 'department.member.remove',
      entityType: 'department',
      entityId: id,
      newValues: { userId },
    })
    return c.json({ data: { ok: true } })
  },
)

departmentsRouter.patch(
  '/:id/head',
  requirePermission(PERMISSIONS.DEPARTMENT_MANAGE),
  async (c) => {
    const id = c.req.param('id')
    const { userId } = parseOrThrow(DepartmentUserSchema, await c.req.json())
    const [u] = await db.select().from(userTable).where(eq(userTable.id, userId))
    if (!u) throw NotFoundError('User')
    await db.update(departments).set({ headUserId: userId, updatedAt: new Date() }).where(eq(departments.id, id))
    await db.update(userTable).set({ role: ROLES.DEPARTMENT_HEAD, departmentId: id }).where(eq(userTable.id, userId))
    await db.insert(departmentMembers).values({ departmentId: id, userId, role: 'HEAD' }).onConflictDoUpdate({
      target: [departmentMembers.departmentId, departmentMembers.userId],
      set: { role: 'HEAD' },
    })
    await recordAudit({
      userId: c.get('user')?.id ?? null,
      action: 'department.head.set',
      entityType: 'department',
      entityId: id,
      newValues: { userId },
    })
    return c.json({ data: { departmentId: id, headUserId: userId } })
  },
)
