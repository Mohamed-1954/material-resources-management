import type { ErrorHandler } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

import { ERROR_CODES } from '@frms/shared'

import { HttpError } from '../shared/errors.ts'
import type { AppEnv } from '../shared/context.ts'

interface ValibotIssue {
  message?: string
  path?: { key?: string }[]
}

interface ValibotError {
  issues: ValibotIssue[]
}

function isValibotError(e: unknown): e is ValibotError {
  return typeof e === 'object' && e !== null && Array.isArray((e as { issues?: unknown }).issues)
}

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  const requestId = c.get('requestId') ?? undefined

  if (err instanceof HttpError) {
    return c.json(
      {
        error: { code: err.code, message: err.message, details: err.details, requestId },
      },
      err.status as ContentfulStatusCode,
    )
  }
  if (isValibotError(err)) {
    return c.json(
      {
        error: {
          code: ERROR_CODES.VALIDATION,
          message: 'Validation failed',
          details: err.issues.map((i) => ({
            path: i.path?.map((p) => p.key).join('.') ?? '',
            message: i.message ?? 'Invalid value',
          })),
          requestId,
        },
      },
      400,
    )
  }
  console.error('[unhandled error]', { requestId, err })
  return c.json(
    {
      error: {
        code: ERROR_CODES.INTERNAL,
        message: 'Internal server error',
        requestId,
      },
    },
    500,
  )
}
