import { Hono } from 'hono'
import { and, desc, eq } from 'drizzle-orm'

import { db } from '../../db/client.ts'
import { notifications } from '../../db/schema.ts'
import { requireAuth } from '../../middleware/auth.ts'
import type { AppEnv } from '../../shared/context.ts'

export const notificationsRouter = new Hono<AppEnv>()
notificationsRouter.use('*', requireAuth)

notificationsRouter.get('/', async (c) => {
  const u = c.get('user') as { id: string }
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, u.id))
    .orderBy(desc(notifications.createdAt))
    .limit(100)
  return c.json({ data: rows })
})

notificationsRouter.get('/unread', async (c) => {
  const u = c.get('user') as { id: string }
  const rows = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, u.id), eq(notifications.read, false)))
    .orderBy(desc(notifications.createdAt))
  return c.json({ data: rows })
})

notificationsRouter.patch('/:id/read', async (c) => {
  const u = c.get('user') as { id: string }
  const id = c.req.param('id')
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, u.id)))
  return c.json({ data: { id } })
})

notificationsRouter.patch('/read-all', async (c) => {
  const u = c.get('user') as { id: string }
  await db.update(notifications).set({ read: true }).where(eq(notifications.userId, u.id))
  return c.json({ data: { ok: true } })
})
