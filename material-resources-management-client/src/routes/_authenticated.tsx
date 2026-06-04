import { createFileRoute, redirect } from "@tanstack/react-router";

import { AppShell } from "../components/layout/AppShell";

/**
 * The root route resolves the session before any child runs, so by the time
 * this `beforeLoad` runs the `context.auth` value is fully populated. No
 * `isLoading` branch is possible.
 */
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
        replace: true,
      });
    }
  },
  component: AppShell,
});
