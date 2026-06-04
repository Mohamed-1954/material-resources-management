import { Hono } from 'hono'
import { and, desc, eq, or } from 'drizzle-orm'

import {
  FAILURE_STATUS,
  AssignTechnicianSchema,
  FailureCreateSchema,
  NOTIFICATION_EVENT,
  PERMISSIONS,
  RESOURCE_STATUS,
  ROLES,
  TechnicalReportSchema,
  type FailureType,
  type Role,
  type ResourceType,
} from '@frms/shared'

import { db } from '../../db/client.ts'
import {
  failureReports,
  resourceAssignments,
  resources,
  technicalReports,
  user as userTable,
  warrantyActions,
} from '../../db/schema.ts'
import { requireAuth, requirePermission } from '../../middleware/auth.ts'
import { newId, recordAudit } from '../../shared/audit.ts'
import { BusinessRuleError, ForbiddenError, NotFoundError } from '../../shared/errors.ts'
import { notifyMany } from '../../shared/notify.ts'
import { parseOrThrow } from '../../shared/validate.ts'
import type { AppEnv } from '../../shared/context.ts'
import { assertPrinterFailureIsHardware, isWarrantyValid } from './maintenance.service.ts'

export const maintenanceRouter = new Hono<AppEnv>()
maintenanceRouter.use('*', requireAuth)

async function ensureCanReportFailure(resourceId: string, userId: string, departmentId: string | null) {
  const rows = await db
    .select()
    .from(resourceAssignments)
    .where(
      and(eq(resourceAssignments.resourceId, resourceId), eq(resourceAssignments.active, true)),
    )
  const allowed = rows.some(
    (r) =>
      r.assignedToUserId === userId ||
      (r.assignedToDepartmentId && r.assignedToDepartmentId === departmentId),
  )
  if (!allowed) {
    throw ForbiddenError('You can only report failures for your own assigned resources')
  }
}

maintenanceRouter.get('/', async (c) => {
  const u = c.get('user') as { id: string; role: Role; departmentId: string | null }
  if (u.role === ROLES.MAINTENANCE_TECHNICIAN) {
    const rows = await db
      .select()
      .from(failureReports)
      .where(or(eq(failureReports.technicianUserId, u.id), eq(failureReports.status, FAILURE_STATUS.REPORTED)))
      .orderBy(desc(failureReports.reportedAt))
    return c.json({ data: rows })
  }
  if (u.role === ROLES.TEACHER) {
    const rows = await db
      .select()
      .from(failureReports)
      .where(eq(failureReports.reportedByUserId, u.id))
      .orderBy(desc(failureReports.reportedAt))
    return c.json({ data: rows })
  }
  if (u.role === ROLES.DEPARTMENT_HEAD && u.departmentId) {
    const rows = await db
      .select()
      .from(failureReports)
      .innerJoin(
        resourceAssignments,
        and(
          eq(resourceAssignments.resourceId, failureReports.resourceId),
          eq(resourceAssignments.assignedToDepartmentId, u.departmentId),
        ),
      )
      .orderBy(desc(failureReports.reportedAt))
    return c.json({ data: rows.map((r) => r.failure_reports) })
  }
  if (u.role === ROLES.ADMIN || u.role === ROLES.RESOURCE_MANAGER) {
    const rows = await db.select().from(failureReports).orderBy(desc(failureReports.reportedAt))
    return c.json({ data: rows })
  }
  return c.json({ data: [] })
})

maintenanceRouter.get('/:id', async (c) => {
  const id = c.req.param('id')
  const [row] = await db.select().from(failureReports).where(eq(failureReports.id, id))
  if (!row) throw NotFoundError('Failure report')
  const [tr] = await db.select().from(technicalReports).where(eq(technicalReports.failureReportId, id))
  return c.json({ data: { ...row, technicalReport: tr ?? null } })
})

maintenanceRouter.post('/', async (c) => {
  const u = c.get('user') as { id: string; role: Role; departmentId: string | null }
  const body = parseOrThrow(FailureCreateSchema, await c.req.json())
  const [r] = await db.select().from(resources).where(eq(resources.id, body.resourceId))
  if (!r) throw NotFoundError('Resource')

  if (u.role === ROLES.TEACHER) {
    await ensureCanReportFailure(body.resourceId, u.id, u.departmentId)
  } else if (u.role !== ROLES.ADMIN && u.role !== ROLES.RESOURCE_MANAGER && u.role !== ROLES.MAINTENANCE_TECHNICIAN) {
    throw ForbiddenError('Insufficient role to report failure')
  }

  if (body.type) {
    assertPrinterFailureIsHardware(r.resourceType as ResourceType, body.type)
  }

  const id = newId()
  await db.transaction(async (tx) => {
    await tx.insert(failureReports).values({
      id,
      resourceId: body.resourceId,
      reportedByUserId: u.id,
      status: FAILURE_STATUS.REPORTED,
      type: body.type ?? null,
      frequency: body.frequency ?? null,
      description: body.description,
    })
    await tx
      .update(resources)
      .set({ status: RESOURCE_STATUS.UNDER_MAINTENANCE, updatedAt: new Date() })
      .where(eq(resources.id, body.resourceId))

    await recordAudit(
      {
        userId: u.id,
        action: 'failure.report',
        entityType: 'failure_report',
        entityId: id,
        newValues: body,
      },
      tx,
    )
  })

  // Post-commit best-effort notification fan-out.
  const techs = await db.select({ id: userTable.id }).from(userTable).where(eq(userTable.role, ROLES.MAINTENANCE_TECHNICIAN))
  await notifyMany(
    techs.map((t) => ({
      userId: t.id,
      event: NOTIFICATION_EVENT.FAILURE_REPORTED,
      message: `New failure reported on ${r.inventoryCode}`,
      link: '/maintenance/failures',
    })),
  )
  return c.json({ data: { id } }, 201)
})

maintenanceRouter.post('/:id/assign-technician', requirePermission(PERMISSIONS.FAILURE_INTERVENE), async (c) => {
  const id = c.req.param('id')
  const u = c.get('user') as { id: string; role: Role }
  // a technician self-assigns or a manager assigns
  const { technicianUserId } = parseOrThrow(AssignTechnicianSchema, await c.req.json())
  const techId = technicianUserId ?? u.id
  await db
    .update(failureReports)
    .set({
      technicianUserId: techId,
      status: FAILURE_STATUS.ASSIGNED,
      updatedAt: new Date(),
    })
    .where(eq(failureReports.id, id))
  await recordAudit({ userId: u.id, action: 'failure.assign', entityType: 'failure_report', entityId: id })
  return c.json({ data: { id, technicianUserId: techId } })
})

maintenanceRouter.post('/:id/start-intervention', requirePermission(PERMISSIONS.FAILURE_INTERVENE), async (c) => {
  const id = c.req.param('id')
  await db
    .update(failureReports)
    .set({ status: FAILURE_STATUS.IN_PROGRESS, updatedAt: new Date() })
    .where(eq(failureReports.id, id))
  return c.json({ data: { id, status: FAILURE_STATUS.IN_PROGRESS } })
})

maintenanceRouter.post('/:id/resolve', requirePermission(PERMISSIONS.FAILURE_INTERVENE), async (c) => {
  const id = c.req.param('id')
  const [fr] = await db.select().from(failureReports).where(eq(failureReports.id, id))
  if (!fr) throw NotFoundError('Failure report')
  await db.transaction(async (tx) => {
    await tx
      .update(failureReports)
      .set({
        status: FAILURE_STATUS.RESOLVED,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(failureReports.id, id))
    await tx
      .update(resources)
      .set({ status: RESOURCE_STATUS.AVAILABLE, updatedAt: new Date() })
      .where(eq(resources.id, fr.resourceId))
  })
  return c.json({ data: { id, status: FAILURE_STATUS.RESOLVED } })
})

maintenanceRouter.post('/:id/mark-severe', requirePermission(PERMISSIONS.FAILURE_INTERVENE), async (c) => {
  const id = c.req.param('id')
  await db
    .update(failureReports)
    .set({
      status: FAILURE_STATUS.SEVERE,
      severity: 'SEVERE',
      updatedAt: new Date(),
    })
    .where(eq(failureReports.id, id))
  return c.json({ data: { id, status: FAILURE_STATUS.SEVERE } })
})

maintenanceRouter.post(
  '/:id/technical-report',
  requirePermission(PERMISSIONS.FAILURE_TECHNICAL_REPORT),
  async (c) => {
    const id = c.req.param('id')
    const u = c.get('user') as { id: string }
    const body = parseOrThrow(TechnicalReportSchema, await c.req.json())
    const [fr] = await db.select().from(failureReports).where(eq(failureReports.id, id))
    if (!fr) throw NotFoundError('Failure report')
    if (fr.status !== FAILURE_STATUS.SEVERE) {
      throw BusinessRuleError('Technical reports are only required for SEVERE failures')
    }
    const [r] = await db.select().from(resources).where(eq(resources.id, fr.resourceId))
    if (!r) throw NotFoundError('Resource')
    assertPrinterFailureIsHardware(r.resourceType as ResourceType, body.type)

    const trId = newId()
    await db.transaction(async (tx) => {
      await tx.insert(technicalReports).values({
        id: trId,
        failureReportId: id,
        technicianUserId: u.id,
        explanation: body.explanation,
        appearedAt: body.appearedAt,
        frequency: body.frequency,
        type: body.type as FailureType,
      })
      await tx
        .update(failureReports)
        .set({
          status: FAILURE_STATUS.TECHNICAL_REPORT_CREATED,
          updatedAt: new Date(),
        })
        .where(eq(failureReports.id, id))
      await recordAudit(
        { userId: u.id, action: 'failure.technical-report', entityType: 'failure_report', entityId: id },
        tx,
      )
    })

    // Post-commit best-effort notification.
    const managers = await db.select({ id: userTable.id }).from(userTable).where(eq(userTable.role, ROLES.RESOURCE_MANAGER))
    await notifyMany(
      managers.map((m) => ({
        userId: m.id,
        event: NOTIFICATION_EVENT.TECHNICAL_REPORT_CREATED,
        message: `Technical report created for failure on ${r.inventoryCode}`,
        link: '/manager/maintenance-decisions',
      })),
    )
    return c.json({ data: { id: trId } }, 201)
  },
)

maintenanceRouter.post(
  '/:id/request-supplier-repair',
  requirePermission(PERMISSIONS.FAILURE_WARRANTY_DECISION),
  async (c) => {
    const id = c.req.param('id')
    const [fr] = await db.select().from(failureReports).where(eq(failureReports.id, id))
    if (!fr) throw NotFoundError('Failure report')
    const [r] = await db.select().from(resources).where(eq(resources.id, fr.resourceId))
    if (!r) throw NotFoundError('Resource')
    if (!isWarrantyValid(r.warrantyEndDate)) {
      throw BusinessRuleError('Warranty has expired — supplier repair cannot be requested')
    }
    const actorId = (c.get('user') as { id: string }).id
    await db.transaction(async (tx) => {
      await tx.insert(warrantyActions).values({
        id: newId(),
        failureReportId: id,
        action: 'REPAIR',
        reason: 'Severe failure requires supplier intervention',
        decidedByUserId: actorId,
      })
      await tx
        .update(failureReports)
        .set({ status: FAILURE_STATUS.SENT_TO_SUPPLIER, updatedAt: new Date() })
        .where(eq(failureReports.id, id))
      await tx
        .update(resources)
        .set({ status: RESOURCE_STATUS.SENT_TO_SUPPLIER, updatedAt: new Date() })
        .where(eq(resources.id, fr.resourceId))
    })
    // Post-commit best-effort notification.
    if (r.supplierId) {
      const supplierUsers = await db
        .select({ id: userTable.id })
        .from(userTable)
        .where(eq(userTable.supplierId, r.supplierId))
      await notifyMany(
        supplierUsers.map((u) => ({
          userId: u.id,
          event: NOTIFICATION_EVENT.SUPPLIER_REPAIR_REQUESTED,
          message: `Supplier repair requested for ${r.inventoryCode}`,
          link: '/supplier/profile',
        })),
      )
    }
    return c.json({ data: { id, action: 'REPAIR' } })
  },
)

maintenanceRouter.post(
  '/:id/request-replacement',
  requirePermission(PERMISSIONS.FAILURE_WARRANTY_DECISION),
  async (c) => {
    const id = c.req.param('id')
    const [fr] = await db.select().from(failureReports).where(eq(failureReports.id, id))
    if (!fr) throw NotFoundError('Failure report')
    const [r] = await db.select().from(resources).where(eq(resources.id, fr.resourceId))
    if (!r) throw NotFoundError('Resource')
    if (!isWarrantyValid(r.warrantyEndDate)) {
      throw BusinessRuleError('Warranty has expired — replacement cannot be requested')
    }
    const actorId = (c.get('user') as { id: string }).id
    await db.transaction(async (tx) => {
      await tx.insert(warrantyActions).values({
        id: newId(),
        failureReportId: id,
        action: 'REPLACEMENT',
        reason: 'Severe failure requires replacement',
        decidedByUserId: actorId,
      })
      await tx
        .update(resources)
        .set({ status: RESOURCE_STATUS.REPLACED, updatedAt: new Date() })
        .where(eq(resources.id, fr.resourceId))
      await tx
        .update(failureReports)
        .set({ status: FAILURE_STATUS.SENT_TO_SUPPLIER, updatedAt: new Date() })
        .where(eq(failureReports.id, id))
    })
    return c.json({ data: { id, action: 'REPLACEMENT' } })
  },
)
