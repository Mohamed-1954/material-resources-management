import { createFileRoute } from "@tanstack/react-router";

import { TeacherResourcesPage } from "@/features/assignments/pages/TeacherResourcesPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/teacher/resources")({
  beforeLoad: requireRole("TEACHER"),
  component: TeacherResourcesPage,
});
