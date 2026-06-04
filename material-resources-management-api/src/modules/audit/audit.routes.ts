import { Hono } from 'hono'
import { and, desc, eq, sql } from 'drizzle-orm'

import { PERMISSIONS } from '@frms/shared'

import { db } from '../../db/client.ts'
import { auditLogs, user as userTable } from '../../db/schema.ts'
import { requireAuth, requirePermission } from '../../middleware/auth.ts'
import type { AppEnv } from '../../shared/context.ts'

export const auditRouter = new Hono<AppEnv>()
auditRouter.use('*', requireAuth, requirePermission(PERMISSIONS.AUDIT_VIEW))

// Resolve the entity row to a human label per entity_type. The CASE narrows
// the lookup to the right table so the planner can use the natural-key index
// on each column. NULL when no resolver matches — the UI then falls back to
// the raw entity id with a friendly prefix.
const entityLabelSql = sql<string | null>`
  CASE ${auditLogs.entityType}
    WHEN 'tender'     THEN (SELECT reference      FROM tenders     WHERE id = ${auditLogs.entityId})
    WHEN 'department' THEN (SELECT code           FROM departments WHERE id = ${auditLogs.entityId})
    WHEN 'supplier'   THEN (SELECT company_name   FROM suppliers   WHERE id = ${auditLogs.entityId})
    WHEN 'resource'   THEN (SELECT inventory_code FROM resources   WHERE id = ${auditLogs.entityId})
    WHEN 'user'       THEN (SELECT email          FROM "user"      WHERE id = ${auditLogs.entityId})
    ELSE NULL
  END
`

const auditSelection = {
  id: auditLogs.id,
  userId: auditLogs.userId,
  userName: userTable.name,
  userEmail: userTable.email,
  action: auditLogs.action,
  entityType: auditLogs.entityType,
  entityId: auditLogs.entityId,
  entityLabel: entityLabelSql,
  oldValues: auditLogs.oldValues,
  newValues: auditLogs.newValues,
  createdAt: auditLogs.createdAt,
}

auditRouter.get('/', async (c) => {
  const rows = await db
    .select(auditSelection)
    .from(auditLogs)
    .leftJoin(userTable, eq(userTable.id, auditLogs.userId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(500)
  return c.json({ data: rows })
})

auditRouter.get('/by-entity/:type/:id', async (c) => {
  const rows = await db
    .select(auditSelection)
    .from(auditLogs)
    .leftJoin(userTable, eq(userTable.id, auditLogs.userId))
    .where(
      and(eq(auditLogs.entityType, c.req.param('type')), eq(auditLogs.entityId, c.req.param('id'))),
    )
    .orderBy(desc(auditLogs.createdAt))
  return c.json({ data: rows })
})
