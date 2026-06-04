/**
 * Extracts a human-readable error message from a TanStack-Form field error array.
 *
 * Errors may be strings (when a raw string is returned from a validator) or
 * objects with a `message` property (Valibot issues). We surface the first one.
 */
export function firstFieldError(errors: readonly unknown[]): string | null {
  for (const error of errors) {
    if (typeof error === "string" && error.trim().length > 0) return error;
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof (error as { message?: unknown }).message === "string"
    ) {
      return (error as { message: string }).message;
    }
  }
  return null;
}
