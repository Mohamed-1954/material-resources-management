import { createFileRoute } from "@tanstack/react-router";

import { SectionLanding } from "@/components/layout/SectionLanding";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/department/")({
  beforeLoad: requireRole("DEPARTMENT_HEAD"),
  component: () => <SectionLanding sectionId="department" />,
});
