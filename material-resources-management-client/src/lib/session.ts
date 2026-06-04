import { queryOptions, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import type { Role } from "@frms/shared";

import { authClient } from "./auth-client";
import type { AuthContext } from "./permissions";

/**
 * Session state lives in the TanStack Query cache.
 *
 * Why this shape:
 *   1. `refetchOnWindowFocus: true` replaces the manual `focus`/`visibilitychange`
 *      listeners I previously wired in a `useEffect`. Query's `focusManager`
 *      already implements the cross-browser logic.
 *   2. `staleTime: 30s` bounds the auth round-trip: navigations within 30s reuse
 *      the cache, longer gaps re-validate against Better-Auth.
 *   3. A single query key lets every consumer share the result — components via
 *      `useSession`/`useAuth`, route guards via `ensureQueryData`.
 *
 * The router context exposes `queryClient`; each route's `beforeLoad` awaits
 * `ensureQueryData(sessionQueryOptions)` rather than reading some
 * React-context-driven `auth` value. That eliminates the entire AuthProvider
 * effect tree.
 */

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  departmentId: string | null;
  supplierId: string | null;
}

export interface AppSession {
  user: AppUser | null;
}

interface RawSessionUser {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
  departmentId?: string | null;
  supplierId?: string | null;
}

async function fetchSession(): Promise<AppSession> {
  try {
    const result = await authClient.getSession();
    const data = result.data as { user?: RawSessionUser } | null | undefined;
    const user = data?.user;
    if (!user) return { user: null };
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? null,
        role: (user.role ?? "TEACHER") as Role,
        departmentId: user.departmentId ?? null,
        supplierId: user.supplierId ?? null,
      },
    };
  } catch {
    return { user: null };
  }
}

export const sessionQueryOptions = queryOptions({
  queryKey: ["auth", "session"] as const,
  queryFn: fetchSession,
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  retry: 1,
});

/** Refetches and resolves with the *fresh* session. Use after sign-in.
 *
 * `fetchQuery` only refetches when the cached entry is stale; with our 30s
 * staleTime, calling this immediately after `signIn.email` would otherwise
 * return the pre-login `{ user: null }` cache and the post-login redirect
 * would bounce back to /login. Override staleTime to 0 so we always hit the
 * server for the fresh authenticated session. */
export async function refreshSession(qc: QueryClient): Promise<AppSession> {
  return qc.fetchQuery({ ...sessionQueryOptions, staleTime: 0 });
}

/**
 * Server signOut + local cache wipe. After this returns, the session cache is
 * deterministically `{ user: null }` so the very next `beforeLoad` redirects
 * to /login without waiting on a network round-trip.
 *
 * Removes *every* non-auth query so an authenticated dataset cannot leak from
 * BFCache when the user presses Back after sign-out.
 */
export async function signOutSession(qc: QueryClient): Promise<void> {
  try {
    await authClient.signOut();
  } finally {
    qc.setQueryData(sessionQueryOptions.queryKey, { user: null } satisfies AppSession);
    qc.removeQueries({
      predicate: (q) => q.queryKey[0] !== "auth",
    });
  }
}

/** Builds the `context.auth` shape consumed by route guards. Pure, sync. */
export function authFromSession(session: AppSession, qc: QueryClient): AuthContext {
  return {
    isAuthenticated: session.user !== null,
    isLoading: false,
    user: session.user,
    refresh: async () => {
      await refreshSession(qc);
    },
    signOut: () => signOutSession(qc),
  };
}

/** Components that just need read access to the session. */
export function useSession() {
  return useQuery(sessionQueryOptions);
}

/**
 * Drop-in replacement for the old `useAuth()` hook. Derives the same shape but
 * powered by the query cache, no separate provider.
 */
export function useAuth(): AuthContext {
  const qc = useQueryClient();
  const session = useSession();
  return useMemo(() => {
    if (session.data) return authFromSession(session.data, qc);
    return {
      isAuthenticated: false,
      isLoading: session.isPending,
      user: null,
      refresh: async () => {
        await refreshSession(qc);
      },
      signOut: () => signOutSession(qc),
    };
  }, [session.data, session.isPending, qc]);
}
