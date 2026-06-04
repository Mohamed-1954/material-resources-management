import { createFileRoute } from "@tanstack/react-router";

import { SectionLanding } from "@/components/layout/SectionLanding";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/teacher/")({
  beforeLoad: requireRole("TEACHER"),
  component: () => <SectionLanding sectionId="teacher" />,
});
