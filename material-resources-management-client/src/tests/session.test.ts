import { QueryClient } from "@tanstack/react-query";
import { describe, expect, test } from "vitest";

import { ROLES } from "@frms/shared";

import { authFromSession, sessionQueryOptions, type AppSession } from "@/lib/session";

describe("authFromSession", () => {
  test("returns unauthenticated context for null user", () => {
    const qc = new QueryClient();
    const auth = authFromSession({ user: null }, qc);
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.isLoading).toBe(false);
    expect(auth.user).toBeNull();
    expect(typeof auth.refresh).toBe("function");
    expect(typeof auth.signOut).toBe("function");
  });

  test("returns authenticated context for a populated user", () => {
    const qc = new QueryClient();
    const session: AppSession = {
      user: {
        id: "u1",
        email: "t@x.com",
        name: null,
        role: ROLES.TEACHER,
        departmentId: null,
        supplierId: null,
      },
    };
    const auth = authFromSession(session, qc);
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.user?.email).toBe("t@x.com");
  });
});

describe("sessionQueryOptions", () => {
  test("uses a stable query key the rest of the app can reference", () => {
    expect(sessionQueryOptions.queryKey).toEqual(["auth", "session"]);
  });

  test("enables refetch-on-focus so we don't reinvent it with useEffect", () => {
    expect(sessionQueryOptions.refetchOnWindowFocus).toBe(true);
  });
});
