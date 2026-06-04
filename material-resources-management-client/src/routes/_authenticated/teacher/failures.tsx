import { createFileRoute } from "@tanstack/react-router";

import { TeacherFailuresPage } from "@/features/maintenance/pages/TeacherFailuresPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/teacher/failures")({
  beforeLoad: requireRole("TEACHER"),
  component: TeacherFailuresPage,
});
