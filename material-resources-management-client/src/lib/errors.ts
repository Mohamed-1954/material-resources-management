import { ApiHttpError } from "./api-client";

export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (error instanceof ApiHttpError) {
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function isForbidden(error: unknown): boolean {
  return error instanceof ApiHttpError && (error.status === 403 || error.code === "FORBIDDEN");
}

export function isUnauthorized(error: unknown): boolean {
  return (
    error instanceof ApiHttpError && (error.status === 401 || error.code === "UNAUTHORIZED")
  );
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiHttpError && (error.status === 404 || error.code === "NOT_FOUND");
}
