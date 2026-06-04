import { ERROR_CODES, type ErrorCode } from '@frms/shared'

export class HttpError extends Error {
  status: number
  code: ErrorCode
  details?: unknown

  constructor(status: number, code: ErrorCode, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export const ValidationError = (message: string, details?: unknown) =>
  new HttpError(400, ERROR_CODES.VALIDATION, message, details)

export const UnauthorizedError = (message = 'Authentication required') =>
  new HttpError(401, ERROR_CODES.UNAUTHORIZED, message)

export const ForbiddenError = (message = 'Forbidden') =>
  new HttpError(403, ERROR_CODES.FORBIDDEN, message)

export const NotFoundError = (entity = 'Resource') =>
  new HttpError(404, ERROR_CODES.NOT_FOUND, `${entity} not found`)

export const ConflictError = (message: string) =>
  new HttpError(409, ERROR_CODES.CONFLICT, message)

export const BusinessRuleError = (message: string, details?: unknown) =>
  new HttpError(422, ERROR_CODES.BUSINESS_RULE, message, details)

export const TooManyRequestsError = (message = 'Too many requests, please try again later') =>
  new HttpError(429, ERROR_CODES.RATE_LIMITED, message)
