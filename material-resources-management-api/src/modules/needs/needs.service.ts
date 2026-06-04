import { and, eq, inArray } from 'drizzle-orm'

import { NEED_STATUS, NOTIFICATION_EVENT, ROLES, type NeedStatus, type Role } from '@frms/shared'

import { db } from '../../db/client.ts'
import { needItems, needRequests, user as userTable } from '../../db/schema.ts'
import { newId, recordAudit } from '../../shared/audit.ts'
import { BusinessRuleError, ForbiddenError, NotFoundError } from '../../shared/errors.ts'
import { notify } from '../../shared/notify.ts'

const VALID_TRANSITIONS: Record<NeedStatus, NeedStatus[]> = {
  [NEED_STATUS.DRAFT]: [NEED_STATUS.SUBMITTED],
  [NEED_STATUS.SUBMITTED]: [
    NEED_STATUS.UNDER_DEPARTMENT_REVIEW,
    NEED_STATUS.CHANGES_REQUESTED,
    NEED_STATUS.APPROVED_BY_DEPARTMENT,
    NEED_STATUS.REJECTED,
  ],
  [NEED_STATUS.UNDER_DEPARTMENT_REVIEW]: [
    NEED_STATUS.CHANGES_REQUESTED,
    NEED_STATUS.APPROVED_BY_DEPARTMENT,
    NEED_STATUS.REJECTED,
  ],
  [NEED_STATUS.CHANGES_REQUESTED]: [NEED_STATUS.SUBMITTED, NEED_STATUS.REJECTED],
  [NEED_STATUS.APPROVED_BY_DEPARTMENT]: [NEED_STATUS.SENT_TO_RESOURCE_MANAGER],
  [NEED_STATUS.SENT_TO_RESOURCE_MANAGER]: [NEED_STATUS.INCLUDED_IN_TENDER],
  [NEED_STATUS.INCLUDED_IN_TENDER]: [],
  [NEED_STATUS.REJECTED]: [],
}

export function assertCanTransition(from: NeedStatus, to: NeedStatus): void {
  const allowed = VALID_TRANSITIONS[from] ?? []
  if (!allowed.includes(to)) {
    throw BusinessRuleError(`Invalid need status transition: ${from} -> ${to}`)
  }
}

export interface CurrentUserCtx {
  id: string
  role: Role
  departmentId: string | null
}

export async function loadNeed(id: string) {
  const [need] = await db.select().from(needRequests).where(eq(needRequests.id, id))
  if (!need) throw NotFoundError('Need request')
  const items = await db.select().from(needItems).where(eq(needItems.needRequestId, id))
  return { ...need, items }
}

export async function transitionNeed(id: string, to: NeedStatus, actor: CurrentUserCtx) {
  const need = await loadNeed(id)

  // Permission: department head can transition needs in their dept; teacher only their own draft -> submitted
  if (actor.role === ROLES.TEACHER) {
    if (need.requestedByUserId !== actor.id) throw ForbiddenError('Not your need request')
    if (to !== NEED_STATUS.SUBMITTED && to !== NEED_STATUS.DRAFT) {
      throw ForbiddenError('Teachers may only submit their own needs')
    }
  } else if (actor.role === ROLES.DEPARTMENT_HEAD) {
    if (need.departmentId !== actor.departmentId) throw ForbiddenError('Not your department')
  } else if (actor.role !== ROLES.ADMIN && actor.role !== ROLES.RESOURCE_MANAGER) {
    throw ForbiddenError('Insufficient role for need transition')
  }

  assertCanTransition(need.status as NeedStatus, to)

  const now = new Date()
  const patch: Record<string, unknown> = { status: to, updatedAt: now }
  if (to === NEED_STATUS.SUBMITTED) patch.submittedAt = now
  if (to === NEED_STATUS.APPROVED_BY_DEPARTMENT) patch.finalizedAt = now
  if (to === NEED_STATUS.SENT_TO_RESOURCE_MANAGER) patch.sentToManagerAt = now
  if (to === NEED_STATUS.REJECTED) patch.rejectedAt = now

  await db.update(needRequests).set(patch).where(eq(needRequests.id, id))

  await recordAudit({
    userId: actor.id,
    action: `need.transition.${to.toLowerCase()}`,
    entityType: 'need_request',
    entityId: id,
    oldValues: { status: need.status },
    newValues: { status: to },
  })

  // Notification fan-out
  if (to === NEED_STATUS.SUBMITTED) {
    const heads = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(and(eq(userTable.role, ROLES.DEPARTMENT_HEAD), eq(userTable.departmentId, need.departmentId)))
    for (const h of heads) {
      await notify({
        userId: h.id,
        event: NOTIFICATION_EVENT.NEED_SUBMITTED,
        message: `New need request submitted in your department`,
        link: `/department/needs/review`,
      })
    }
  }
  if (to === NEED_STATUS.APPROVED_BY_DEPARTMENT || to === NEED_STATUS.SENT_TO_RESOURCE_MANAGER) {
    await notify({
      userId: need.requestedByUserId,
      event: NOTIFICATION_EVENT.NEED_APPROVED,
      message: `Your need request was ${to.replace(/_/g, ' ').toLowerCase()}`,
      link: `/teacher/needs`,
    })
  }
  return loadNeed(id)
}

export async function markNeedItemsIncludedInTender(needRequestIds: string[]) {
  if (needRequestIds.length === 0) return
  await db
    .update(needRequests)
    .set({ status: NEED_STATUS.INCLUDED_IN_TENDER, updatedAt: new Date() })
    .where(inArray(needRequests.id, needRequestIds))
}

export function makeNewNeedId(): string {
  return newId()
}
