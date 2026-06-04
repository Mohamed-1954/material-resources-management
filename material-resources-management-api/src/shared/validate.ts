import * as v from 'valibot'

import { ValidationError } from './errors.ts'

export function parseOrThrow<TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(
  schema: TSchema,
  input: unknown,
): v.InferOutput<TSchema> {
  const result = v.safeParse(schema, input)
  if (!result.success) {
    throw ValidationError('Validation failed', {
      issues: result.issues.map((i) => ({
        path: i.path?.map((p) => p.key).join('.') ?? '',
        message: i.message,
      })),
    })
  }
  return result.output
}
