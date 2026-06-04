import { Hono } from 'hono'
import { and, desc, eq, gte, inArray, lte } from 'drizzle-orm'

import {
  NEED_STATUS,
  NOTIFICATION_EVENT,
  PERMISSIONS,
  ROLES,
  TENDER_STATUS,
  TenderCreateSchema,
  TenderIncludeNeedsSchema,
  TenderItemSchema,
  TenderUpdateSchema,
  type Role,
  type TenderStatus,
} from '@frms/shared'

import { db } from '../../db/client.ts'
import {
  needItems,
  needRequests,
  tenderItems,
  tenders,
  user as userTable,
} from '../../db/schema.ts'
import { requireAuth, requirePermission } from '../../middleware/auth.ts'
import { newId, recordAudit } from '../../shared/audit.ts'
import { ConflictError, NotFoundError } from '../../shared/errors.ts'
import { notifyMany } from '../../shared/notify.ts'
import { parseOrThrow } from '../../shared/validate.ts'
import type { AppEnv } from '../../shared/context.ts'
import { assertTenderTransition, isTenderActive } from './tenders.service.ts'

export const tendersRouter = new Hono<AppEnv>()
tendersRouter.use('*', requireAuth)

async function loadTender(id: string) {
  const [t] = await db.select().from(tenders).where(eq(tenders.id, id))
  if (!t) throw NotFoundError('Tender')
  const items = await db.select().from(tenderItems).where(eq(tenderItems.tenderId, id))
  return { ...t, items }
}

tendersRouter.get('/', async (c) => {
  const u = c.get('user') as { role: Role }
  if (u.role === ROLES.SUPPLIER) {
    // suppliers only see active tenders
    const today = new Date().toISOString().slice(0, 10)
    const rows = await db
      .select()
      .from(tenders)
      .where(
        and(
          eq(tenders.status, TENDER_STATUS.PUBLISHED),
          lte(tenders.startDate, today),
          gte(tenders.endDate, today),
        ),
      )
      .orderBy(desc(tenders.startDate))
    return c.json({ data: rows })
  }
  const rows = await db.select().from(tenders).orderBy(desc(tenders.createdAt))
  return c.json({ data: rows })
})

tendersRouter.get('/active', async (c) => {
  const today = new Date().toISOString().slice(0, 10)
  const rows = await db
    .select()
    .from(tenders)
    .where(
      and(
        eq(tenders.status, TENDER_STATUS.PUBLISHED),
        lte(tenders.startDate, today),
        gte(tenders.endDate, today),
      ),
    )
    .orderBy(desc(tenders.startDate))
  return c.json({ data: rows })
})

tendersRouter.get('/:id', async (c) => {
  const tender = await loadTender(c.req.param('id'))
  const u = c.get('user') as { role: Role }
  if (u.role === ROLES.SUPPLIER && !isTenderActive(tender)) {
    throw NotFoundError('Tender')
  }
  return c.json({ data: tender })
})

tendersRouter.post('/', requirePermission(PERMISSIONS.TENDER_MANAGE), async (c) => {
  const body = parseOrThrow(TenderCreateSchema, await c.req.json())
  if (new Date(body.endDate) < new Date(body.startDate)) {
    throw ConflictError('endDate must be after startDate')
  }
  const dup = await db.select().from(tenders).where(eq(tenders.reference, body.reference)).limit(1)
  if (dup.length > 0) throw ConflictError('Tender reference already exists')
  const id = newId()
  await db.insert(tenders).values({
    id,
    reference: body.reference,
    title: body.title,
    description: body.description ?? null,
    status: TENDER_STATUS.DRAFT,
    startDate: body.startDate,
    endDate: body.endDate,
    createdByUserId: (c.get('user') as { id: string }).id,
  })
  await recordAudit({
    userId: (c.get('user') as { id: string }).id,
    action: 'tender.create',
    entityType: 'tender',
    entityId: id,
    newValues: body,
  })
  return c.json({ data: await loadTender(id) }, 201)
})

tendersRouter.patch('/:id', requirePermission(PERMISSIONS.TENDER_MANAGE), async (c) => {
  const id = c.req.param('id')
  const body = parseOrThrow(TenderUpdateSchema, await c.req.json())
  const [before] = await db.select().from(tenders).where(eq(tenders.id, id))
  if (!before) throw NotFoundError('Tender')
  if (before.status !== TENDER_STATUS.DRAFT) {
    throw ConflictError('Only DRAFT tenders may be edited')
  }
  await db
    .update(tenders)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where(eq(tenders.id, id))
  await recordAudit({
    userId: (c.get('user') as { id: string }).id,
    action: 'tender.update',
    entityType: 'tender',
    entityId: id,
    oldValues: before,
    newValues: body,
  })
  return c.json({ data: await loadTender(id) })
})

async function transitionTender(id: string, to: TenderStatus, actorId: string) {
  const [t] = await db.select().from(tenders).where(eq(tenders.id, id))
  if (!t) throw NotFoundError('Tender')
  assertTenderTransition(t.status as TenderStatus, to)
  const now = new Date()
  const patch: Record<string, unknown> = { status: to, updatedAt: now }
  if (to === TENDER_STATUS.PUBLISHED) patch.publishedAt = now
  if (to === TENDER_STATUS.CLOSED) patch.closedAt = now
  if (to === TENDER_STATUS.CANCELLED) patch.cancelledAt = now
  await db.update(tenders).set(patch).where(eq(tenders.id, id))
  await recordAudit({
    userId: actorId,
    action: `tender.transition.${to.toLowerCase()}`,
    entityType: 'tender',
    entityId: id,
    oldValues: { status: t.status },
    newValues: { status: to },
  })
  if (to === TENDER_STATUS.PUBLISHED) {
    const suppliers = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.role, ROLES.SUPPLIER))
    await notifyMany(
      suppliers.map((s) => ({
        userId: s.id,
        event: NOTIFICATION_EVENT.TENDER_PUBLISHED,
        message: `New tender published: ${t.reference}`,
        link: `/supplier/tenders/${id}`,
      })),
    )
  }
  return loadTender(id)
}

tendersRouter.post('/:id/publish', requirePermission(PERMISSIONS.TENDER_MANAGE), async (c) => {
  return c.json({
    data: await transitionTender(c.req.param('id'), TENDER_STATUS.PUBLISHED, (c.get('user') as { id: string }).id),
  })
})

tendersRouter.post('/:id/close', requirePermission(PERMISSIONS.TENDER_MANAGE), async (c) => {
  return c.json({
    data: await transitionTender(c.req.param('id'), TENDER_STATUS.CLOSED, (c.get('user') as { id: string }).id),
  })
})

tendersRouter.post('/:id/start-evaluation', requirePermission(PERMISSIONS.TENDER_MANAGE), async (c) => {
  return c.json({
    data: await transitionTender(c.req.param('id'), TENDER_STATUS.EVALUATION, (c.get('user') as { id: string }).id),
  })
})

tendersRouter.post('/:id/cancel', requirePermission(PERMISSIONS.TENDER_MANAGE), async (c) => {
  return c.json({
    data: await transitionTender(c.req.param('id'), TENDER_STATUS.CANCELLED, (c.get('user') as { id: string }).id),
  })
})

tendersRouter.post('/:id/items', requirePermission(PERMISSIONS.TENDER_MANAGE), async (c) => {
  const id = c.req.param('id')
  const body = parseOrThrow(TenderItemSchema, await c.req.json())
  const itemId = newId()
  await db.insert(tenderItems).values({
    id: itemId,
    tenderId: id,
    resourceType: body.resourceType,
    brand: body.brand ?? null,
    specs: body.specs ?? null,
    quantity: body.quantity,
  })
  return c.json({ data: { id: itemId } }, 201)
})

tendersRouter.delete(
  '/:id/items/:itemId',
  requirePermission(PERMISSIONS.TENDER_MANAGE),
  async (c) => {
    await db
      .delete(tenderItems)
      .where(and(eq(tenderItems.tenderId, c.req.param('id')), eq(tenderItems.id, c.req.param('itemId'))))
    return c.json({ data: { ok: true } })
  },
)

tendersRouter.post(
  '/:id/include-needs',
  requirePermission(PERMISSIONS.TENDER_MANAGE),
  async (c) => {
    const id = c.req.param('id')
    const { needRequestIds } = parseOrThrow(TenderIncludeNeedsSchema, await c.req.json())
    const items = await db
      .select()
      .from(needItems)
      .innerJoin(needRequests, eq(needRequests.id, needItems.needRequestId))
    const filtered = items.filter((row) => needRequestIds.includes(row.need_items.needRequestId))
    if (filtered.length === 0) throw NotFoundError('Need items')

    await db.transaction(async (tx) => {
      await tx.insert(tenderItems).values(
        filtered.map((row) => ({
          id: newId(),
          tenderId: id,
          resourceType: row.need_items.resourceType,
          brand: row.need_items.brand,
          specs:
            row.need_items.cpu || row.need_items.printSpeed
              ? JSON.stringify({
                  cpu: row.need_items.cpu,
                  ram: row.need_items.ram,
                  disk: row.need_items.disk,
                  screen: row.need_items.screen,
                  printSpeed: row.need_items.printSpeed,
                  resolution: row.need_items.resolution,
                })
              : null,
          quantity: row.need_items.quantity,
          sourceNeedItemId: row.need_items.id,
        })),
      )
      await tx
        .update(needRequests)
        .set({
          status: NEED_STATUS.INCLUDED_IN_TENDER,
          updatedAt: new Date(),
        })
        .where(inArray(needRequests.id, needRequestIds))
    })
    return c.json({ data: { included: filtered.length } })
  },
)
