import { Hono } from 'hono'
import { and, desc, eq } from 'drizzle-orm'

import {
  ASSIGNMENT_TARGET,
  NOTIFICATION_EVENT,
  PERMISSIONS,
  RESOURCE_STATUS,
  ResourceAssignSchema,
  type Role,
} from '@frms/shared'

import { db } from '../../db/client.ts'
import {
  departments,
  resourceAssignments,
  resources,
  user as userTable,
} from '../../db/schema.ts'
import { requireAuth, requirePermission } from '../../middleware/auth.ts'
import { newId, recordAudit } from '../../shared/audit.ts'
import { BusinessRuleError, NotFoundError } from '../../shared/errors.ts'
import { notify } from '../../shared/notify.ts'
import { parseOrThrow } from '../../shared/validate.ts'
import type { AppEnv } from '../../shared/context.ts'

export const assignmentsRouter = new Hono<AppEnv>()
assignmentsRouter.use('*', requireAuth)

assignmentsRouter.get('/', async (c) => {
  const rows = await db.select().from(resourceAssignments).orderBy(desc(resourceAssignments.assignedAt))
  return c.json({ data: rows })
})

assignmentsRouter.get('/by-resource/:resourceId', async (c) => {
  const rows = await db
    .select()
    .from(resourceAssignments)
    .where(eq(resourceAssignments.resourceId, c.req.param('resourceId')))
    .orderBy(desc(resourceAssignments.assignedAt))
  return c.json({ data: rows })
})

assignmentsRouter.get('/by-user/:userId', async (c) => {
  const rows = await db
    .select()
    .from(resourceAssignments)
    .where(
      and(
        eq(resourceAssignments.assignedToUserId, c.req.param('userId')),
        eq(resourceAssignments.active, true),
      ),
    )
  return c.json({ data: rows })
})

assignmentsRouter.get('/by-department/:departmentId', async (c) => {
  const rows = await db
    .select()
    .from(resourceAssignments)
    .where(
      and(
        eq(resourceAssignments.assignedToDepartmentId, c.req.param('departmentId')),
        eq(resourceAssignments.active, true),
      ),
    )
  return c.json({ data: rows })
})

assignmentsRouter.post(
  '/by-resource/:resourceId',
  requirePermission(PERMISSIONS.RESOURCE_ASSIGN),
  async (c) => {
    const resourceId = c.req.param('resourceId')
    const body = parseOrThrow(ResourceAssignSchema, await c.req.json())

    const [resource] = await db.select().from(resources).where(eq(resources.id, resourceId))
    if (!resource) throw NotFoundError('Resource')
    if (
      resource.status === RESOURCE_STATUS.RETIRED ||
      resource.status === RESOURCE_STATUS.LOST ||
      resource.status === RESOURCE_STATUS.REPLACED
    ) {
      throw BusinessRuleError(`Cannot assign a ${resource.status} resource`)
    }

    const activeRows = await db
      .select()
      .from(resourceAssignments)
      .where(
        and(eq(resourceAssignments.resourceId, resourceId), eq(resourceAssignments.active, true)),
      )
    if (activeRows.length > 0) {
      throw BusinessRuleError(
        'Resource already has an active assignment — unassign first to preserve history',
      )
    }

    let targetUser: string | null = null
    let targetDept: string | null = null
    if (body.targetType === ASSIGNMENT_TARGET.USER) {
      const [u] = await db.select().from(userTable).where(eq(userTable.id, body.userId))
      if (!u) throw NotFoundError('User')
      targetUser = u.id
    } else {
      const [d] = await db.select().from(departments).where(eq(departments.id, body.departmentId))
      if (!d) throw NotFoundError('Department')
      targetDept = d.id
    }

    const id = newId()
    await db.insert(resourceAssignments).values({
      id,
      resourceId,
      targetType: body.targetType,
      assignedToUserId: targetUser,
      assignedToDepartmentId: targetDept,
      assignedByUserId: (c.get('user') as { id: string }).id,
      notes: body.notes ?? null,
      active: true,
    })
    await db
      .update(resources)
      .set({ status: RESOURCE_STATUS.ASSIGNED, updatedAt: new Date() })
      .where(eq(resources.id, resourceId))

    await recordAudit({
      userId: (c.get('user') as { id: string }).id,
      action: 'resource.assign',
      entityType: 'resource',
      entityId: resourceId,
      newValues: body,
    })

    if (targetUser) {
      await notify({
        userId: targetUser,
        event: NOTIFICATION_EVENT.RESOURCE_ASSIGNED,
        message: `Resource ${resource.inventoryCode} has been assigned to you`,
        link: '/teacher/resources',
      })
    }
    return c.json({ data: { id } }, 201)
  },
)

assignmentsRouter.post(
  '/by-resource/:resourceId/unassign',
  requirePermission(PERMISSIONS.RESOURCE_ASSIGN),
  async (c) => {
    const resourceId = c.req.param('resourceId')
    const now = new Date()
    const updated = await db
      .update(resourceAssignments)
      .set({ active: false, unassignedAt: now, updatedAt: now })
      .where(
        and(eq(resourceAssignments.resourceId, resourceId), eq(resourceAssignments.active, true)),
      )
      .returning()
    if (updated.length === 0) throw NotFoundError('Active assignment')
    await db
      .update(resources)
      .set({ status: RESOURCE_STATUS.AVAILABLE, updatedAt: now })
      .where(eq(resources.id, resourceId))
    await recordAudit({
      userId: (c.get('user') as { id: string }).id,
      action: 'resource.unassign',
      entityType: 'resource',
      entityId: resourceId,
    })
    return c.json({ data: { resourceId, unassigned: updated.length } })
  },
)

// authenticated user shortcut: list "my" resources
assignmentsRouter.get('/my', async (c) => {
  const u = c.get('user') as { id: string; role: Role; departmentId: string | null }
  const personal = await db
    .select()
    .from(resourceAssignments)
    .where(and(eq(resourceAssignments.assignedToUserId, u.id), eq(resourceAssignments.active, true)))
  const dept = u.departmentId
    ? await db
        .select()
        .from(resourceAssignments)
        .where(
          and(
            eq(resourceAssignments.assignedToDepartmentId, u.departmentId),
            eq(resourceAssignments.active, true),
          ),
        )
    : []
  return c.json({ data: { personal, department: dept } })
})
