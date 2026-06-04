import { Hono, type Context } from 'hono'
import { and, desc, eq, inArray } from 'drizzle-orm'

import {
  NEED_STATUS,
  NeedCreateSchema,
  PERMISSIONS,
  ROLES,
  type Role,
} from '@frms/shared'

import { db } from '../../db/client.ts'
import { needItems, needRequests } from '../../db/schema.ts'
import { requireAuth, requirePermission } from '../../middleware/auth.ts'
import { newId, recordAudit } from '../../shared/audit.ts'
import { ForbiddenError, NotFoundError } from '../../shared/errors.ts'
import { parseOrThrow } from '../../shared/validate.ts'
import type { AppEnv } from '../../shared/context.ts'
import { loadNeed, transitionNeed } from './needs.service.ts'

export const needsRouter = new Hono<AppEnv>()
needsRouter.use('*', requireAuth)

function actorFromCtx(c: Context<AppEnv>) {
  const u = c.get('user') as { id: string; role: Role; departmentId: string | null }
  return { id: u.id, role: u.role, departmentId: u.departmentId }
}

needsRouter.get('/', async (c) => {
  const u = c.get('user') as { id: string; role: Role; departmentId: string | null }
  let rows: typeof needRequests.$inferSelect[] = []
  if (u.role === ROLES.ADMIN || u.role === ROLES.RESOURCE_MANAGER) {
    rows = await db.select().from(needRequests).orderBy(desc(needRequests.createdAt))
  } else if (u.role === ROLES.DEPARTMENT_HEAD && u.departmentId) {
    rows = await db
      .select()
      .from(needRequests)
      .where(eq(needRequests.departmentId, u.departmentId))
      .orderBy(desc(needRequests.createdAt))
  } else if (u.role === ROLES.TEACHER) {
    rows = await db
      .select()
      .from(needRequests)
      .where(eq(needRequests.requestedByUserId, u.id))
      .orderBy(desc(needRequests.createdAt))
  } else {
    throw ForbiddenError('No access to needs')
  }
  return c.json({ data: rows })
})

needsRouter.get('/:id', async (c) => {
  const need = await loadNeed(c.req.param('id'))
  const u = c.get('user') as { id: string; role: Role; departmentId: string | null }
  if (u.role === ROLES.TEACHER && need.requestedByUserId !== u.id) {
    throw ForbiddenError('Not your need')
  }
  if (u.role === ROLES.DEPARTMENT_HEAD && need.departmentId !== u.departmentId) {
    throw ForbiddenError('Not your department')
  }
  return c.json({ data: need })
})

needsRouter.post('/', requirePermission(PERMISSIONS.NEED_CREATE_OWN), async (c) => {
  const u = c.get('user') as { id: string; departmentId: string | null }
  if (!u.departmentId) throw ForbiddenError('You must be assigned to a department')
  const departmentId = u.departmentId
  const body = parseOrThrow(NeedCreateSchema, await c.req.json())
  const id = newId()
  await db.transaction(async (tx) => {
    await tx.insert(needRequests).values({
      id,
      departmentId,
      requestedByUserId: u.id,
      status: NEED_STATUS.DRAFT,
      notes: body.notes ?? null,
    })
    await tx.insert(needItems).values(
      body.items.map((item) => ({
        id: newId(),
        needRequestId: id,
        resourceType: item.resourceType,
        brand: item.brand ?? null,
        cpu: 'cpu' in item ? item.cpu ?? null : null,
        ram: 'ram' in item ? item.ram ?? null : null,
        disk: 'disk' in item ? item.disk ?? null : null,
        screen: 'screen' in item ? item.screen ?? null : null,
        printSpeed: 'printSpeed' in item ? item.printSpeed ?? null : null,
        resolution: 'resolution' in item ? item.resolution ?? null : null,
        quantity: item.quantity,
        justification: item.justification ?? null,
      })),
    )
    await recordAudit(
      {
        userId: u.id,
        action: 'need.create',
        entityType: 'need_request',
        entityId: id,
        newValues: body,
      },
      tx,
    )
  })
  return c.json({ data: await loadNeed(id) }, 201)
})

// department-level convenience
needsRouter.get('/by-department/:departmentId', async (c) => {
  const u = c.get('user') as { role: Role; departmentId: string | null }
  const departmentId = c.req.param('departmentId')
  if (u.role === ROLES.DEPARTMENT_HEAD && u.departmentId !== departmentId) {
    throw ForbiddenError('Not your department')
  }
  const rows = await db
    .select()
    .from(needRequests)
    .where(eq(needRequests.departmentId, departmentId))
    .orderBy(desc(needRequests.createdAt))
  return c.json({ data: rows })
})

needsRouter.post('/by-department/:departmentId/finalize', async (c) => {
  const u = c.get('user') as { id: string; role: Role; departmentId: string | null }
  if (u.role !== ROLES.DEPARTMENT_HEAD || u.departmentId !== c.req.param('departmentId')) {
    throw ForbiddenError('Only department head of this department can finalize')
  }
  const ids = (
    await db
      .select({ id: needRequests.id })
      .from(needRequests)
      .where(
        and(
          eq(needRequests.departmentId, c.req.param('departmentId')),
          eq(needRequests.status, NEED_STATUS.UNDER_DEPARTMENT_REVIEW),
        ),
      )
  ).map((r) => r.id)
  if (ids.length === 0) throw NotFoundError('Needs to finalize')
  for (const id of ids) {
    await transitionNeed(id, NEED_STATUS.APPROVED_BY_DEPARTMENT, actorFromCtx(c))
  }
  return c.json({ data: { finalized: ids.length } })
})

needsRouter.post('/by-department/:departmentId/send-to-resource-manager', async (c) => {
  const u = c.get('user') as { id: string; role: Role; departmentId: string | null }
  if (u.role !== ROLES.DEPARTMENT_HEAD || u.departmentId !== c.req.param('departmentId')) {
    throw ForbiddenError('Only department head can send to resource manager')
  }
  const rows = await db
    .select({ id: needRequests.id })
    .from(needRequests)
    .where(
      and(
        eq(needRequests.departmentId, c.req.param('departmentId')),
        eq(needRequests.status, NEED_STATUS.APPROVED_BY_DEPARTMENT),
      ),
    )
  if (rows.length === 0) throw NotFoundError('Needs ready to send')
  await db
    .update(needRequests)
    .set({
      status: NEED_STATUS.SENT_TO_RESOURCE_MANAGER,
      sentToManagerAt: new Date(),
      updatedAt: new Date(),
    })
    .where(inArray(needRequests.id, rows.map((r) => r.id)))
  return c.json({ data: { sent: rows.length } })
})

needsRouter.post('/:id/submit', async (c) => {
  const need = await transitionNeed(c.req.param('id'), NEED_STATUS.SUBMITTED, actorFromCtx(c))
  return c.json({ data: need })
})

needsRouter.post('/:id/approve', async (c) => {
  const need = await transitionNeed(c.req.param('id'), NEED_STATUS.APPROVED_BY_DEPARTMENT, actorFromCtx(c))
  return c.json({ data: need })
})

needsRouter.post('/:id/reject', async (c) => {
  const need = await transitionNeed(c.req.param('id'), NEED_STATUS.REJECTED, actorFromCtx(c))
  return c.json({ data: need })
})

needsRouter.post('/:id/request-changes', async (c) => {
  const need = await transitionNeed(c.req.param('id'), NEED_STATUS.CHANGES_REQUESTED, actorFromCtx(c))
  return c.json({ data: need })
})

needsRouter.post('/:id/send-to-resource-manager', async (c) => {
  const need = await transitionNeed(c.req.param('id'), NEED_STATUS.SENT_TO_RESOURCE_MANAGER, actorFromCtx(c))
  return c.json({ data: need })
})
