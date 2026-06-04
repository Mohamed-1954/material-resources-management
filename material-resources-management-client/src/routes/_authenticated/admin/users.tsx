import { createFileRoute } from "@tanstack/react-router";

import { UsersPage } from "@/features/users/pages/UsersPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/admin/users")({
  beforeLoad: requireRole("ADMIN"),
  component: UsersPage,
});
