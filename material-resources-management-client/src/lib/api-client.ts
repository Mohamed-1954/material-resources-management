import type { ApiError, ApiSuccess } from "@frms/shared";

import { env } from "./env";

export class ApiHttpError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: opts.method ?? "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok) {
    const err = (json as ApiError | null)?.error;
    throw new ApiHttpError(
      response.status,
      err?.code ?? "UNKNOWN_ERROR",
      err?.message ?? response.statusText ?? "Request failed",
      err?.details,
    );
  }

  return (json as ApiSuccess<T>).data as T;
}

export const apiGet = <T,>(path: string, signal?: AbortSignal) =>
  api<T>(path, { method: "GET", signal });
export const apiPost = <T,>(path: string, body?: unknown) =>
  api<T>(path, { method: "POST", body });
export const apiPatch = <T,>(path: string, body?: unknown) =>
  api<T>(path, { method: "PATCH", body });
export const apiDelete = <T,>(path: string) => api<T>(path, { method: "DELETE" });
