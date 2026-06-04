import { createFileRoute } from "@tanstack/react-router";

import { TeacherNeedsPage } from "@/features/needs/pages/TeacherNeedsPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/teacher/needs")({
  beforeLoad: requireRole("TEACHER"),
  component: TeacherNeedsPage,
});
