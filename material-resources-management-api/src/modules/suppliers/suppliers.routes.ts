import { Hono } from 'hono'
import { eq } from 'drizzle-orm'

import {
  PERMISSIONS,
  ROLES,
  SUPPLIER_STATUS,
  SupplierBlacklistSchema,
  SupplierLinkSchema,
  SupplierUpdateSchema,
  type Role,
} from '@frms/shared'

import { db } from '../../db/client.ts'
import { suppliers, user as userTable } from '../../db/schema.ts'
import { requireAuth, requirePermission } from '../../middleware/auth.ts'
import { recordAudit } from '../../shared/audit.ts'
import { ForbiddenError, NotFoundError } from '../../shared/errors.ts'
import { parseOrThrow } from '../../shared/validate.ts'
import type { AppEnv } from '../../shared/context.ts'

export const suppliersRouter = new Hono<AppEnv>()
suppliersRouter.use('*', requireAuth)

suppliersRouter.get('/', requirePermission(PERMISSIONS.SUPPLIER_MANAGE), async (c) => {
  const rows = await db.select().from(suppliers)
  return c.json({ data: rows })
})

suppliersRouter.get('/me', async (c) => {
  const u = c.get('user') as { role: Role; supplierId: string | null }
  if (u.role !== ROLES.SUPPLIER || !u.supplierId) throw ForbiddenError('Not a supplier')
  const [s] = await db.select().from(suppliers).where(eq(suppliers.id, u.supplierId))
  if (!s) throw NotFoundError('Supplier')
  return c.json({ data: s })
})

// Public-friendly: list active suppliers for use in offer evaluation views
suppliersRouter.get('/_/active-count', async (c) => {
  const rows = await db.select().from(suppliers).where(eq(suppliers.status, SUPPLIER_STATUS.ACTIVE))
  return c.json({ data: rows.length })
})

// associate logged-in supplier user to a supplier (used during registration)
suppliersRouter.post('/_/link-current-user', async (c) => {
  const u = c.get('user') as { id: string; role: Role; supplierId: string | null }
  if (u.role !== ROLES.SUPPLIER) throw ForbiddenError('Not a supplier user')
  if (u.supplierId) throw ForbiddenError('Already linked')
  const { supplierId } = parseOrThrow(SupplierLinkSchema, await c.req.json())
  await db.update(userTable).set({ supplierId }).where(eq(userTable.id, u.id))
  return c.json({ data: { ok: true } })
})

suppliersRouter.get('/:id', async (c) => {
  const u = c.get('user') as { role: Role; supplierId: string | null }
  const id = c.req.param('id')
  if (u.role === ROLES.SUPPLIER && u.supplierId !== id) throw ForbiddenError('Not your supplier profile')
  const [s] = await db.select().from(suppliers).where(eq(suppliers.id, id))
  if (!s) throw NotFoundError('Supplier')
  return c.json({ data: s })
})

suppliersRouter.patch('/:id', async (c) => {
  const u = c.get('user') as { id: string; role: Role; supplierId: string | null }
  const id = c.req.param('id')
  // Either: an admin/manager, or this supplier updating its own profile
  if (
    u.role !== ROLES.ADMIN &&
    u.role !== ROLES.RESOURCE_MANAGER &&
    !(u.role === ROLES.SUPPLIER && u.supplierId === id)
  ) {
    throw ForbiddenError('Cannot update this supplier')
  }
  const body = parseOrThrow(SupplierUpdateSchema, await c.req.json())
  const [before] = await db.select().from(suppliers).where(eq(suppliers.id, id))
  if (!before) throw NotFoundError('Supplier')
  await db
    .update(suppliers)
    .set({
      ...(body.companyName !== undefined ? { companyName: body.companyName } : {}),
      ...(body.location !== undefined ? { location: body.location } : {}),
      ...(body.address !== undefined ? { address: body.address } : {}),
      ...(body.website !== undefined ? { website: body.website } : {}),
      ...(body.managerName !== undefined ? { managerName: body.managerName } : {}),
      updatedAt: new Date(),
    })
    .where(eq(suppliers.id, id))
  await recordAudit({
    userId: u.id,
    action: 'supplier.update',
    entityType: 'supplier',
    entityId: id,
    oldValues: before,
    newValues: body,
  })
  return c.json({ data: { id } })
})

suppliersRouter.post('/:id/blacklist', requirePermission(PERMISSIONS.SUPPLIER_BLACKLIST), async (c) => {
  const id = c.req.param('id')
  const body = parseOrThrow(SupplierBlacklistSchema, await c.req.json())
  const [before] = await db.select().from(suppliers).where(eq(suppliers.id, id))
  if (!before) throw NotFoundError('Supplier')
  await db
    .update(suppliers)
    .set({
      status: SUPPLIER_STATUS.BLACKLISTED,
      blacklistedAt: new Date(),
      blacklistReason: body.reason,
      updatedAt: new Date(),
    })
    .where(eq(suppliers.id, id))
  await recordAudit({
    userId: (c.get('user') as { id: string }).id,
    action: 'supplier.blacklist',
    entityType: 'supplier',
    entityId: id,
    oldValues: { status: before.status },
    newValues: { status: SUPPLIER_STATUS.BLACKLISTED, reason: body.reason },
  })
  return c.json({ data: { id, status: SUPPLIER_STATUS.BLACKLISTED } })
})

suppliersRouter.post(
  '/:id/remove-from-blacklist',
  requirePermission(PERMISSIONS.SUPPLIER_BLACKLIST),
  async (c) => {
    const id = c.req.param('id')
    const [before] = await db.select().from(suppliers).where(eq(suppliers.id, id))
    if (!before) throw NotFoundError('Supplier')
    await db
      .update(suppliers)
      .set({
        status: SUPPLIER_STATUS.ACTIVE,
        blacklistedAt: null,
        blacklistReason: null,
        updatedAt: new Date(),
      })
      .where(eq(suppliers.id, id))
    await recordAudit({
      userId: (c.get('user') as { id: string }).id,
      action: 'supplier.unblacklist',
      entityType: 'supplier',
      entityId: id,
      oldValues: { status: before.status },
      newValues: { status: SUPPLIER_STATUS.ACTIVE },
    })
    return c.json({ data: { id, status: SUPPLIER_STATUS.ACTIVE } })
  },
)
