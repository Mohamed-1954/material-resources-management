import { Hono } from 'hono'
import { desc, eq, isNull } from 'drizzle-orm'

import {
  OFFER_STATUS,
  PERMISSIONS,
  RESOURCE_STATUS,
  RESOURCE_TYPES,
  ResourceDeliverySchema,
  type ResourceType,
} from '@frms/shared'

import { db } from '../../db/client.ts'
import {
  computerSpecs,
  printerSpecs,
  resources,
  supplierOffers,
} from '../../db/schema.ts'
import { requireAuth, requirePermission } from '../../middleware/auth.ts'
import { newId, recordAudit } from '../../shared/audit.ts'
import { BusinessRuleError, NotFoundError } from '../../shared/errors.ts'
import { parseOrThrow } from '../../shared/validate.ts'
import type { AppEnv } from '../../shared/context.ts'

export const inventoryRouter = new Hono<AppEnv>()
inventoryRouter.use('*', requireAuth)

function generateInventoryCode(resourceType: ResourceType): string {
  const prefix = resourceType === RESOURCE_TYPES.COMPUTER ? 'CPU' : 'PRT'
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `${prefix}-${date}-${newId().slice(0, 6).toUpperCase()}`
}

inventoryRouter.get('/', async (c) => {
  const rows = await db.select().from(resources).orderBy(desc(resources.createdAt))
  return c.json({ data: rows })
})

inventoryRouter.get('/available', async (c) => {
  const rows = await db.select().from(resources).where(eq(resources.status, RESOURCE_STATUS.AVAILABLE))
  return c.json({ data: rows })
})

inventoryRouter.get('/_/unassigned', async (c) => {
  // resources with no active assignment are considered unassigned
  const rows = await db.select().from(resources).where(eq(resources.status, RESOURCE_STATUS.AVAILABLE))
  return c.json({ data: rows })
})

inventoryRouter.get('/_/orphaned', async (c) => {
  const rows = await db.select().from(resources).where(isNull(resources.offerId))
  return c.json({ data: rows })
})

inventoryRouter.get('/:id', async (c) => {
  const id = c.req.param('id')
  const [r] = await db.select().from(resources).where(eq(resources.id, id))
  if (!r) throw NotFoundError('Resource')
  const [cs] = await db.select().from(computerSpecs).where(eq(computerSpecs.resourceId, id))
  const [ps] = await db.select().from(printerSpecs).where(eq(printerSpecs.resourceId, id))
  return c.json({ data: { ...r, computerSpecs: cs ?? null, printerSpecs: ps ?? null } })
})

inventoryRouter.post(
  '/register-delivery',
  requirePermission(PERMISSIONS.RESOURCE_MANAGE),
  async (c) => {
    const body = parseOrThrow(ResourceDeliverySchema, await c.req.json())
    const [offer] = await db.select().from(supplierOffers).where(eq(supplierOffers.id, body.offerId))
    if (!offer) throw NotFoundError('Offer')
    if (offer.status !== OFFER_STATUS.ACCEPTED) {
      throw BusinessRuleError('Resources can only be registered for an ACCEPTED offer')
    }

    // Validate the whole payload before any write so a printer with computer
    // specs at index 5 doesn't leave 4 resources committed and 1 rejected.
    for (const r of body.resources) {
      if (r.resourceType === RESOURCE_TYPES.PRINTER && (r.cpu || r.ram || r.disk || r.screen)) {
        throw BusinessRuleError('Printer resources must not include computer specs')
      }
    }

    const created: string[] = []
    const actorId = (c.get('user') as { id: string }).id
    await db.transaction(async (tx) => {
      for (const r of body.resources) {
        const id = newId()
        await tx.insert(resources).values({
          id,
          inventoryCode: generateInventoryCode(r.resourceType as ResourceType),
          resourceType: r.resourceType,
          brand: r.brand ?? null,
          status: RESOURCE_STATUS.AVAILABLE,
          supplierId: offer.supplierId,
          tenderId: offer.tenderId,
          offerId: offer.id,
          deliveryDate: body.deliveryDate,
          warrantyEndDate: r.warrantyEndDate,
        })
        if (r.resourceType === RESOURCE_TYPES.COMPUTER) {
          await tx.insert(computerSpecs).values({
            resourceId: id,
            cpu: r.cpu ?? null,
            ram: r.ram ?? null,
            disk: r.disk ?? null,
            screen: r.screen ?? null,
          })
        } else {
          await tx.insert(printerSpecs).values({
            resourceId: id,
            printSpeed: r.printSpeed ?? null,
            resolution: r.resolution ?? null,
          })
        }
        created.push(id)
      }
      await recordAudit(
        {
          userId: actorId,
          action: 'resource.register-delivery',
          entityType: 'resource',
          newValues: { offerId: offer.id, count: created.length },
        },
        tx,
      )
    })
    return c.json({ data: { created } }, 201)
  },
)

inventoryRouter.delete('/:id', requirePermission(PERMISSIONS.RESOURCE_MANAGE), async (c) => {
  // Soft retire — preserve history
  const id = c.req.param('id')
  await db
    .update(resources)
    .set({ status: RESOURCE_STATUS.RETIRED, updatedAt: new Date() })
    .where(eq(resources.id, id))
  await recordAudit({
    userId: (c.get('user') as { id: string }).id,
    action: 'resource.retire',
    entityType: 'resource',
    entityId: id,
  })
  return c.json({ data: { id, status: RESOURCE_STATUS.RETIRED } })
})
