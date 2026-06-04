import { Hono } from 'hono'
import { eq } from 'drizzle-orm'

import { ROLES, SupplierRegisterSchema } from '@frms/shared'

import { auth } from '../../auth/auth.ts'
import { db } from '../../db/client.ts'
import { suppliers, user as userTable } from '../../db/schema.ts'
import { rateLimit } from '../../middleware/rate-limit.ts'
import { newId, recordAudit } from '../../shared/audit.ts'
import { ConflictError } from '../../shared/errors.ts'
import { parseOrThrow } from '../../shared/validate.ts'
import type { AppEnv } from '../../shared/context.ts'

export const customAuthRouter = new Hono<AppEnv>()

// Per-IP rate limit for the single public-write endpoint in the API. Better-Auth's
// own limiter only covers /api/auth/*; this route is mounted at /api/auth-extras
// and would otherwise be unbounded. 5 attempts per minute is well above any
// legitimate user flow and well below an automated abuse rate.
const registerSupplierRateLimit = rateLimit({ windowMs: 60_000, max: 5 })

/**
 * Public supplier registration: creates a new user and a supplier record
 * with role=SUPPLIER. Internal/privileged roles can never be requested
 * here — they require admin user creation.
 */
customAuthRouter.post('/register-supplier', registerSupplierRateLimit, async (c) => {
  const body = parseOrThrow(SupplierRegisterSchema, await c.req.json())

  const existing = await db.select().from(userTable).where(eq(userTable.email, body.email)).limit(1)
  if (existing.length > 0) throw ConflictError('User with this email already exists')

  // Better-Auth's signUpEmail performs its own DB writes through the Drizzle
  // adapter — it cannot participate in our transaction. Run it first, then
  // wrap the supplier-row + role-elevation + audit triple in a single tx so
  // a partial failure doesn't leave an orphan user with the default TEACHER
  // role and no supplier record.
  const created = await auth.api.signUpEmail({
    headers: c.req.raw.headers,
    body: {
      email: body.email,
      password: body.password,
      name: body.name,
    },
  })

  const supplierId = newId()
  await db.transaction(async (tx) => {
    await tx.insert(suppliers).values({
      id: supplierId,
      companyName: body.companyName,
      location: body.location ?? null,
      address: body.address ?? null,
      website: body.website ?? null,
      managerName: body.managerName ?? body.name,
      status: 'ACTIVE',
      ownerUserId: created.user.id,
    })

    await tx
      .update(userTable)
      .set({
        role: ROLES.SUPPLIER,
        supplierId,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, created.user.id))

    await recordAudit(
      {
        userId: null,
        action: 'supplier.register',
        entityType: 'supplier',
        entityId: supplierId,
        newValues: { email: body.email, companyName: body.companyName },
      },
      tx,
    )
  })

  return c.json(
    {
      data: {
        userId: created.user.id,
        supplierId,
      },
    },
    201,
  )
})
