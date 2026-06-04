import { createRouter } from "@tanstack/react-router";

import type { AuthContext } from "./lib/permissions";
import { queryClient } from "./lib/query-client";
import { routeTree } from "./routeTree.gen";

export interface AppRouterContext {
  queryClient: typeof queryClient;
  /**
   * Populated by the root route's async `beforeLoad`. Marked optional so that
   * the bootstrap context passed to `RouterProvider` doesn't need a stub; once
   * the root resolves, every child sees a fully-typed `auth` value.
   */
  auth: AuthContext;
}

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
  } as unknown as AppRouterContext,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
