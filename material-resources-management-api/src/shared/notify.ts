import { db, type Executor } from '../db/client.ts'
import { notifications } from '../db/schema.ts'
import type { NotificationEvent } from '@frms/shared'
import { newId } from './audit.ts'

export interface NotifyInput {
  userId: string
  event: NotificationEvent
  message: string
  link?: string | null
}

// Notifications are best-effort: failures are logged but never propagate, so
// they cannot break the caller's transaction (per BACKEND_AUDIT.md C1: notify
// runs outside the tx in production code, but the optional executor parameter
// allows callers that prefer "fail loud" semantics during tests or admin
// scripts to opt in.).
export async function notify(input: NotifyInput, executor: Executor = db): Promise<void> {
  try {
    await executor.insert(notifications).values({
      id: newId(),
      userId: input.userId,
      event: input.event,
      message: input.message,
      link: input.link ?? null,
      read: false,
    })
  } catch (e) {
    console.error('[notify] failed to insert notification:', e)
  }
}

export async function notifyMany(inputs: NotifyInput[], executor: Executor = db): Promise<void> {
  if (inputs.length === 0) return
  try {
    await executor.insert(notifications).values(
      inputs.map((i) => ({
        id: newId(),
        userId: i.userId,
        event: i.event,
        message: i.message,
        link: i.link ?? null,
        read: false,
      })),
    )
  } catch (e) {
    console.error('[notify] failed to insert notifications:', e)
  }
}
