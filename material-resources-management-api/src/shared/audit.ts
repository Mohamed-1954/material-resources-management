import { nanoid } from 'nanoid'

import { db, type Executor } from '../db/client.ts'
import { auditLogs } from '../db/schema.ts'

export interface AuditPayload {
  userId: string | null
  action: string
  entityType: string
  entityId?: string | null
  oldValues?: unknown
  newValues?: unknown
  ipAddress?: string | null
  userAgent?: string | null
}

export async function recordAudit(payload: AuditPayload, executor: Executor = db): Promise<void> {
  try {
    await executor.insert(auditLogs).values({
      id: nanoid(),
      userId: payload.userId,
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId ?? null,
      oldValues: payload.oldValues ?? null,
      newValues: payload.newValues ?? null,
      ipAddress: payload.ipAddress ?? null,
      userAgent: payload.userAgent ?? null,
    })
  } catch (e) {
    // When running inside a transaction, swallowing the error would let the
    // transaction commit without the audit row. Re-throw so the caller's tx
    // rolls back. Outside a tx, the throw bubbles to the central error handler
    // which already has the request context for logging.
    if (executor !== db) {
      throw e
    }
    console.error('[audit] failed to write audit entry:', e)
  }
}

export function newId(): string {
  return nanoid()
}
