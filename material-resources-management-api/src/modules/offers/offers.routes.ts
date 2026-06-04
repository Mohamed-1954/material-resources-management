import { Hono } from 'hono'
import { desc, eq, inArray } from 'drizzle-orm'

import {
  NOTIFICATION_EVENT,
  OFFER_STATUS,
  OfferCreateSchema,
  OfferEliminateSchema,
  OfferRejectSchema,
  PERMISSIONS,
  ROLES,
  SUPPLIER_STATUS,
  TENDER_STATUS,
  type OfferStatus,
  type Role,
} from '@frms/shared'

import { db } from '../../db/client.ts'
import {
  suppliers,
  supplierOfferItems,
  supplierOffers,
  tenders,
  user as userTable,
} from '../../db/schema.ts'
import { requireAuth, requirePermission } from '../../middleware/auth.ts'
import { newId, recordAudit } from '../../shared/audit.ts'
import { BusinessRuleError, ForbiddenError, NotFoundError } from '../../shared/errors.ts'
import { notifyMany } from '../../shared/notify.ts'
import { parseOrThrow } from '../../shared/validate.ts'
import type { AppEnv } from '../../shared/context.ts'
import {
  assertOfferTransition,
  computeOfferTotal,
  selectLowestValidOffer,
} from './offers.service.ts'
import { isTenderActive } from '../tenders/tenders.service.ts'

export const offersRouter = new Hono<AppEnv>()
offersRouter.use('*', requireAuth)

async function loadOffer(id: string) {
  const [o] = await db.select().from(supplierOffers).where(eq(supplierOffers.id, id))
  if (!o) throw NotFoundError('Offer')
  const items = await db.select().from(supplierOfferItems).where(eq(supplierOfferItems.offerId, id))
  return { ...o, items }
}

offersRouter.get('/', async (c) => {
  const u = c.get('user') as { role: Role; supplierId: string | null }
  if (u.role === ROLES.SUPPLIER) {
    if (!u.supplierId) return c.json({ data: [] })
    const rows = await db
      .select()
      .from(supplierOffers)
      .where(eq(supplierOffers.supplierId, u.supplierId))
      .orderBy(desc(supplierOffers.createdAt))
    return c.json({ data: rows })
  }
  if (u.role !== ROLES.ADMIN && u.role !== ROLES.RESOURCE_MANAGER) throw ForbiddenError('No access')
  const rows = await db.select().from(supplierOffers).orderBy(desc(supplierOffers.createdAt))
  return c.json({ data: rows })
})

offersRouter.get('/:id', async (c) => {
  const id = c.req.param('id')
  const u = c.get('user') as { role: Role; supplierId: string | null }
  const offer = await loadOffer(id)
  if (u.role === ROLES.SUPPLIER && offer.supplierId !== u.supplierId) throw ForbiddenError('Not your offer')
  return c.json({ data: offer })
})

// supplier creates an offer for a tender
offersRouter.post('/by-tender/:tenderId', async (c) => {
  const u = c.get('user') as { role: Role; supplierId: string | null }
  if (u.role !== ROLES.SUPPLIER) throw ForbiddenError('Only suppliers may submit offers')
  if (!u.supplierId) throw ForbiddenError('Supplier profile required')

  const tenderId = c.req.param('tenderId')
  const [t] = await db.select().from(tenders).where(eq(tenders.id, tenderId))
  if (!t) throw NotFoundError('Tender')
  if (!isTenderActive(t as { status: string; startDate: string; endDate: string })) {
    throw BusinessRuleError('Tender is not currently active')
  }

  const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, u.supplierId))
  if (!supplier) throw NotFoundError('Supplier')
  if (supplier.status === SUPPLIER_STATUS.BLACKLISTED) {
    throw ForbiddenError('Blacklisted suppliers cannot submit offers')
  }

  const body = parseOrThrow(OfferCreateSchema, await c.req.json())
  const total = computeOfferTotal(body.items)
  const id = newId()
  await db.insert(supplierOffers).values({
    id,
    tenderId,
    supplierId: u.supplierId,
    status: OFFER_STATUS.DRAFT,
    totalPrice: total.toFixed(2),
  })
  await db.insert(supplierOfferItems).values(
    body.items.map((it) => ({
      id: newId(),
      offerId: id,
      tenderItemId: it.tenderItemId ?? null,
      resourceType: it.resourceType,
      brand: it.brand,
      unitPrice: it.unitPrice.toFixed(2),
      quantity: it.quantity,
      warrantyDurationMonths: it.warrantyDurationMonths,
      futureDeliveryDate: it.futureDeliveryDate,
      technicalDetails: it.technicalDetails ?? null,
    })),
  )
  await recordAudit({
    userId: (c.get('user') as { id: string }).id,
    action: 'offer.create',
    entityType: 'supplier_offer',
    entityId: id,
    newValues: { tenderId, total },
  })
  return c.json({ data: await loadOffer(id) }, 201)
})

offersRouter.post('/:id/submit', async (c) => {
  const id = c.req.param('id')
  const u = c.get('user') as { id: string; role: Role; supplierId: string | null }
  const offer = await loadOffer(id)
  if (u.role !== ROLES.SUPPLIER || offer.supplierId !== u.supplierId) {
    throw ForbiddenError('Not your offer')
  }
  const [t] = await db.select().from(tenders).where(eq(tenders.id, offer.tenderId))
  if (!t || !isTenderActive(t as { status: string; startDate: string; endDate: string })) {
    throw BusinessRuleError('Tender no longer accepts offers')
  }
  assertOfferTransition(offer.status as OfferStatus, OFFER_STATUS.SUBMITTED)
  await db
    .update(supplierOffers)
    .set({
      status: OFFER_STATUS.SUBMITTED,
      submittedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(supplierOffers.id, id))
  // notify resource managers
  const managers = await db.select({ id: userTable.id }).from(userTable).where(eq(userTable.role, ROLES.RESOURCE_MANAGER))
  await notifyMany(
    managers.map((m) => ({
      userId: m.id,
      event: NOTIFICATION_EVENT.OFFER_SUBMITTED,
      message: `New supplier offer submitted for tender ${t.reference}`,
      link: `/manager/tenders/${offer.tenderId}/evaluation`,
    })),
  )
  await recordAudit({
    userId: u.id,
    action: 'offer.submit',
    entityType: 'supplier_offer',
    entityId: id,
  })
  return c.json({ data: await loadOffer(id) })
})

offersRouter.post('/:id/withdraw', async (c) => {
  const id = c.req.param('id')
  const u = c.get('user') as { id: string; role: Role; supplierId: string | null }
  const offer = await loadOffer(id)
  if (u.role !== ROLES.SUPPLIER || offer.supplierId !== u.supplierId) throw ForbiddenError('Not your offer')
  assertOfferTransition(offer.status as OfferStatus, OFFER_STATUS.WITHDRAWN)
  await db
    .update(supplierOffers)
    .set({ status: OFFER_STATUS.WITHDRAWN, updatedAt: new Date() })
    .where(eq(supplierOffers.id, id))
  return c.json({ data: { ok: true } })
})

offersRouter.post('/:id/eliminate', requirePermission(PERMISSIONS.OFFER_EVALUATE), async (c) => {
  const id = c.req.param('id')
  const body = parseOrThrow(OfferEliminateSchema, await c.req.json())
  const offer = await loadOffer(id)
  assertOfferTransition(offer.status as OfferStatus, OFFER_STATUS.ELIMINATED)
  await db
    .update(supplierOffers)
    .set({
      status: OFFER_STATUS.ELIMINATED,
      eliminationReason: body.reason,
      decidedAt: new Date(),
      decidedByUserId: (c.get('user') as { id: string }).id,
      updatedAt: new Date(),
    })
    .where(eq(supplierOffers.id, id))
  await recordAudit({
    userId: (c.get('user') as { id: string }).id,
    action: 'offer.eliminate',
    entityType: 'supplier_offer',
    entityId: id,
    newValues: { reason: body.reason },
  })
  // notify supplier owners
  const ownerUsers = await db
    .select({ id: userTable.id })
    .from(userTable)
    .where(eq(userTable.supplierId, offer.supplierId))
  await notifyMany(
    ownerUsers.map((u) => ({
      userId: u.id,
      event: NOTIFICATION_EVENT.SUPPLIER_ELIMINATED,
      message: `Your offer was eliminated: ${body.reason}`,
      link: `/supplier/offers/${id}`,
    })),
  )
  return c.json({ data: { id, status: OFFER_STATUS.ELIMINATED } })
})

offersRouter.post('/:id/accept', requirePermission(PERMISSIONS.OFFER_EVALUATE), async (c) => {
  const id = c.req.param('id')
  const actorId = (c.get('user') as { id: string }).id
  const offer = await loadOffer(id)
  assertOfferTransition(offer.status as OfferStatus, OFFER_STATUS.ACCEPTED)

  // verify it is a valid lowest offer for the tender (advisory check)
  const otherOffers = await db
    .select({
      id: supplierOffers.id,
      totalPrice: supplierOffers.totalPrice,
      status: supplierOffers.status,
      supplierStatus: suppliers.status,
    })
    .from(supplierOffers)
    .innerJoin(suppliers, eq(suppliers.id, supplierOffers.supplierId))
    .where(eq(supplierOffers.tenderId, offer.tenderId))
  const lowest = selectLowestValidOffer(
    otherOffers.map((o) => ({ ...o, status: o.status as OfferStatus })),
  )
  if (lowest && lowest.id !== id) {
    throw BusinessRuleError(
      `A lower valid offer exists (${lowest.id}). Eliminate it first or document the deviation.`,
    )
  }

  // Critical-path writes are atomic: accepted offer + reject siblings + AWARD
  // tender + audit. Notifications stay outside (best-effort).
  const rejectIds = await db.transaction(async (tx) => {
    await tx
      .update(supplierOffers)
      .set({
        status: OFFER_STATUS.ACCEPTED,
        decidedAt: new Date(),
        decidedByUserId: actorId,
        updatedAt: new Date(),
      })
      .where(eq(supplierOffers.id, id))

    const others = await tx
      .select({ id: supplierOffers.id, status: supplierOffers.status })
      .from(supplierOffers)
      .where(eq(supplierOffers.tenderId, offer.tenderId))
    const idsToReject = others
      .filter(
        (o) =>
          o.id !== id &&
          (o.status === OFFER_STATUS.SUBMITTED || o.status === OFFER_STATUS.UNDER_REVIEW),
      )
      .map((o) => o.id)
    if (idsToReject.length > 0) {
      await tx
        .update(supplierOffers)
        .set({
          status: OFFER_STATUS.REJECTED,
          rejectionReason: 'Another offer was accepted',
          decidedAt: new Date(),
          decidedByUserId: actorId,
          updatedAt: new Date(),
        })
        .where(inArray(supplierOffers.id, idsToReject))
    }

    await tx
      .update(tenders)
      .set({
        status: TENDER_STATUS.AWARDED,
        awardedAt: new Date(),
        awardedOfferId: id,
        updatedAt: new Date(),
      })
      .where(eq(tenders.id, offer.tenderId))

    await recordAudit(
      {
        userId: actorId,
        action: 'offer.accept',
        entityType: 'supplier_offer',
        entityId: id,
      },
      tx,
    )

    return idsToReject
  })

  // Post-commit best-effort notifications. Failures here never roll back the
  // commit above; they log and continue.
  const winner = await db
    .select({ id: userTable.id })
    .from(userTable)
    .where(eq(userTable.supplierId, offer.supplierId))
  await notifyMany(
    winner.map((u) => ({
      userId: u.id,
      event: NOTIFICATION_EVENT.OFFER_ACCEPTED,
      message: 'Your offer has been accepted!',
      link: `/supplier/offers/${id}`,
    })),
  )
  if (rejectIds.length > 0) {
    const losers = await db
      .select({ userId: userTable.id, supplierId: userTable.supplierId })
      .from(userTable)
      .innerJoin(supplierOffers, eq(supplierOffers.supplierId, userTable.supplierId))
      .where(inArray(supplierOffers.id, rejectIds))
    await notifyMany(
      losers.map((u) => ({
        userId: u.userId,
        event: NOTIFICATION_EVENT.OFFER_REJECTED,
        message: 'Your offer was not selected for this tender',
        link: '/supplier/offers',
      })),
    )
  }

  return c.json({ data: { id, status: OFFER_STATUS.ACCEPTED } })
})

offersRouter.post('/:id/reject', requirePermission(PERMISSIONS.OFFER_EVALUATE), async (c) => {
  const id = c.req.param('id')
  const body = parseOrThrow(OfferRejectSchema, await c.req.json())
  const offer = await loadOffer(id)
  assertOfferTransition(offer.status as OfferStatus, OFFER_STATUS.REJECTED)
  await db
    .update(supplierOffers)
    .set({
      status: OFFER_STATUS.REJECTED,
      rejectionReason: body.reason,
      decidedAt: new Date(),
      decidedByUserId: (c.get('user') as { id: string }).id,
      updatedAt: new Date(),
    })
    .where(eq(supplierOffers.id, id))
  await recordAudit({
    userId: (c.get('user') as { id: string }).id,
    action: 'offer.reject',
    entityType: 'supplier_offer',
    entityId: id,
    newValues: { reason: body.reason },
  })
  return c.json({ data: { id, status: OFFER_STATUS.REJECTED } })
})
