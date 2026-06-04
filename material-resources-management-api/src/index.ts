import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { requestId } from 'hono/request-id'
import { secureHeaders } from 'hono/secure-headers'

import { ERROR_CODES } from '@frms/shared'

import { auth } from './auth/auth.ts'
import { env, isTest } from './config/env.ts'
import { errorHandler } from './middleware/error-handler.ts'
import { sessionMiddleware } from './middleware/auth.ts'
import { customAuthRouter } from './modules/auth/auth.routes.ts'
import { assignmentsRouter } from './modules/assignments/assignments.routes.ts'
import { auditRouter } from './modules/audit/audit.routes.ts'
import { departmentsRouter } from './modules/departments/departments.routes.ts'
import { inventoryRouter } from './modules/inventory/inventory.routes.ts'
import { maintenanceRouter } from './modules/maintenance/maintenance.routes.ts'
import { needsRouter } from './modules/needs/needs.routes.ts'
import { notificationsRouter } from './modules/notifications/notifications.routes.ts'
import { offersRouter } from './modules/offers/offers.routes.ts'
import { suppliersRouter } from './modules/suppliers/suppliers.routes.ts'
import { tendersRouter } from './modules/tenders/tenders.routes.ts'
import { usersRouter } from './modules/users/users.routes.ts'
import type { AppEnv } from './shared/context.ts'

const app = new Hono<AppEnv>()

// Order matters: requestId first so logger/errorHandler can correlate, then headers,
// then CORS, then session.
app.use('*', requestId())
if (!isTest) {
  app.use('*', logger())
}
app.use('*', secureHeaders())
app.use(
  '*',
  cors({
    origin: env.trustedOrigins,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
  }),
)
app.use('*', sessionMiddleware)
app.onError(errorHandler)
app.notFound((c) =>
  c.json(
    {
      error: {
        code: ERROR_CODES.NOT_FOUND,
        message: `Route not found: ${c.req.method} ${c.req.path}`,
      },
    },
    404,
  ),
)

app.get('/', (c) =>
  c.json({ data: { name: 'Faculty Material Resources Management API', version: '0.1.0' } }),
)
app.get('/health', (c) => c.json({ data: { status: 'ok', uptime: process.uptime() } }))

// Better Auth handler — must come BEFORE the modular routes that share /api
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

// Custom registration route mounted alongside Better Auth
app.route('/api/auth-extras', customAuthRouter)

app.route('/api/users', usersRouter)
app.route('/api/departments', departmentsRouter)
app.route('/api/needs', needsRouter)
app.route('/api/tenders', tendersRouter)
app.route('/api/suppliers', suppliersRouter)
app.route('/api/offers', offersRouter)
app.route('/api/resources', inventoryRouter)
app.route('/api/assignments', assignmentsRouter)
app.route('/api/failures', maintenanceRouter)
app.route('/api/notifications', notificationsRouter)
app.route('/api/audit-logs', auditRouter)

export default {
  port: env.apiPort,
  fetch: app.fetch,
}

export { app }
