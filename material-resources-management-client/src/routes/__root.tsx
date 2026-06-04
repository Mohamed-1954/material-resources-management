import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Loader2 } from "lucide-react";

import { authFromSession, sessionQueryOptions } from "../lib/session";
import type { AppRouterContext } from "../router";

/**
 * Single authoritative session resolution.
 *
 * `beforeLoad` is async, so TanStack Router suspends rendering on the parent
 * route until the session promise settles, then injects the resolved
 * `context.auth` into every child route. No React effects, no flash.
 *
 * `ensureQueryData` reuses the cache between navigations; only the initial
 * page-load and Query's own `refetchOnWindowFocus` cycle pay the network cost.
 */
export const Route = createRootRouteWithContext<AppRouterContext>()({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(sessionQueryOptions);
    return { auth: authFromSession(session, context.queryClient) };
  },
  component: RootComponent,
  pendingComponent: RootPending,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      {import.meta.env.DEV ? <TanStackRouterDevtools position="bottom-right" /> : null}
    </>
  );
}

function RootPending() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="grid min-h-[100dvh] place-items-center bg-background text-muted-foreground"
    >
      <div className="flex items-center gap-3 text-sm">
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        <span>Loading your session…</span>
      </div>
    </div>
  );
}
