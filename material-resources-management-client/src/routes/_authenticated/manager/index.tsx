import { createFileRoute } from "@tanstack/react-router";

import { SectionLanding } from "@/components/layout/SectionLanding";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/manager/")({
  beforeLoad: requireRole("RESOURCE_MANAGER"),
  component: () => <SectionLanding sectionId="manager" />,
});
